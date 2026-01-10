import { supabase } from './supabase';

export const COMMISSION_RATES = {
  free: 0.30,           // 30% commission pour gratuit
  premium: 0.15,        // 15% commission pour premium
  'premium+elite': 0.05 // 5% commission pour premium+elite
};

export const STARS_TO_EUROS_RATE = 0.01; // 1 étoile = 0.01€

interface GiftTransactionResult {
  success: boolean;
  remainingStars?: number;
  error?: string;
  creatorGain?: number;
  commission?: number;
}

export async function processGiftTransaction(
  fromUserId: string,
  toUserId: string,
  giftId: string,
  giftName: string,
  stars: number
): Promise<GiftTransactionResult> {
  try {
    // 1. Vérifier le solde de l'expéditeur
    const { data: fromUser, error: fromError } = await supabase
      .from('astra_profiles')
      .select('stars_balance, first_name')
      .eq('id', fromUserId)
      .maybeSingle();

    if (fromError || !fromUser) {
      return { success: false, error: 'Utilisateur expéditeur introuvable' };
    }

    if (fromUser.stars_balance < stars) {
      return { success: false, error: 'Solde insuffisant' };
    }

    // 2. Récupérer les infos du créateur
    const { data: toUser, error: toError } = await supabase
      .from('astra_profiles')
      .select('stars_balance, total_earnings, total_commission_paid, premium_tier, first_name, is_creator')
      .eq('id', toUserId)
      .maybeSingle();

    if (toError || !toUser) {
      return { success: false, error: 'Créateur introuvable' };
    }

    // 3. Calculer la commission selon le plan
    const premiumTier = toUser.premium_tier || 'free';
    const commissionRate = COMMISSION_RATES[premiumTier as keyof typeof COMMISSION_RATES] ?? COMMISSION_RATES.free;
    const creatorGain = Math.floor(stars * (1 - commissionRate));
    const platformCommission = stars - creatorGain;

    // 4. Débiter l'expéditeur
    const newFromBalance = fromUser.stars_balance - stars;
    const { error: updateFromError } = await supabase
      .from('astra_profiles')
      .update({ stars_balance: newFromBalance })
      .eq('id', fromUserId);

    if (updateFromError) {
      console.error('Error updating sender balance:', updateFromError);
      return { success: false, error: 'Erreur lors de la mise à jour du solde' };
    }

    // 5. Créditer le créateur
    const newToBalance = toUser.stars_balance + creatorGain;
    const newTotalEarnings = toUser.total_earnings + creatorGain;
    const newTotalCommission = toUser.total_commission_paid + platformCommission;
    const newWithdrawableBalance = newTotalEarnings * STARS_TO_EUROS_RATE;

    const { error: updateToError } = await supabase
      .from('astra_profiles')
      .update({
        stars_balance: newToBalance,
        total_earnings: newTotalEarnings,
        total_commission_paid: newTotalCommission,
        withdrawable_balance: newWithdrawableBalance,
        is_creator: true, // Marque automatiquement comme créateur dès le premier cadeau reçu
      })
      .eq('id', toUserId);

    if (updateToError) {
      console.error('Error updating creator balance:', updateToError);
      // Rollback l'expéditeur
      await supabase
        .from('astra_profiles')
        .update({ stars_balance: fromUser.stars_balance })
        .eq('id', fromUserId);
      return { success: false, error: 'Erreur lors du crédit créateur' };
    }

    // 6. Enregistrer la transaction pour l'expéditeur (débit)
    await supabase.from('stars_transactions').insert({
      user_id: fromUserId,
      amount: -stars,
      transaction_type: 'gift_sent',
      gift_id: giftId,
      recipient_id: toUserId,
    });

    // 7. Enregistrer la transaction pour le créateur (crédit)
    await supabase.from('stars_transactions').insert({
      user_id: toUserId,
      amount: creatorGain,
      transaction_type: 'gift_received',
      gift_id: giftId,
      recipient_id: fromUserId,
      commission_rate: commissionRate,
      creator_gain: creatorGain,
      platform_commission: platformCommission,
    });

    console.log(`✅ Gift sent: ${fromUser.first_name} → ${toUser.first_name}`);
    console.log(`   ${giftName} (${stars} ⭐)`);
    console.log(`   Creator gain: ${creatorGain} ⭐ (${(commissionRate * 100).toFixed(0)}% commission)`);
    console.log(`   Platform: ${platformCommission} ⭐`);

    return {
      success: true,
      remainingStars: newFromBalance,
      creatorGain,
      commission: platformCommission,
    };
  } catch (error) {
    console.error('Error in processGiftTransaction:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

export async function getCreatorStats(userId: string) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('astra_profiles')
      .select('total_earnings, total_commission_paid, withdrawable_balance, stars_balance, premium_tier, is_creator')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return null;
    }

    // Stats des cadeaux reçus
    const { data: transactions, error: transactionsError } = await supabase
      .from('stars_transactions')
      .select('amount, created_at, gift_id, recipient_id')
      .eq('user_id', userId)
      .eq('transaction_type', 'gift_received')
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return null;
    }

    // Calculer statistiques
    const totalGiftsReceived = transactions?.length || 0;
    const averageGift = totalGiftsReceived > 0
      ? Math.floor(profile.total_earnings / totalGiftsReceived)
      : 0;

    // Commission rate actuelle
    const premiumTier = profile.premium_tier || 'free';
    const currentCommissionRate = COMMISSION_RATES[premiumTier as keyof typeof COMMISSION_RATES] ?? COMMISSION_RATES.free;

    return {
      totalEarnings: profile.total_earnings,
      totalCommissionPaid: profile.total_commission_paid,
      withdrawableBalance: profile.withdrawable_balance,
      starsBalance: profile.stars_balance,
      premiumTier,
      currentCommissionRate,
      totalGiftsReceived,
      averageGift,
      recentTransactions: transactions?.slice(0, 10) || [],
      isCreator: profile.is_creator,
    };
  } catch (error) {
    console.error('Error in getCreatorStats:', error);
    return null;
  }
}

export async function requestWithdrawal(
  creatorId: string,
  amountStars: number,
  paymentMethod: string,
  paymentDetails: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier le solde
    const { data: profile, error: profileError } = await supabase
      .from('astra_profiles')
      .select('total_earnings, withdrawable_balance')
      .eq('id', creatorId)
      .maybeSingle();

    if (profileError || !profile) {
      return { success: false, error: 'Profil introuvable' };
    }

    if (profile.total_earnings < amountStars) {
      return { success: false, error: 'Solde insuffisant' };
    }

    const amountEuros = amountStars * STARS_TO_EUROS_RATE;

    // Minimum de retrait : 50€
    if (amountEuros < 50) {
      return { success: false, error: 'Montant minimum : 50€ (5000 étoiles)' };
    }

    // Créer la demande de retrait
    const { error: insertError } = await supabase
      .from('withdrawal_requests')
      .insert({
        creator_id: creatorId,
        amount_stars: amountStars,
        amount_euros: amountEuros,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'pending',
      });

    if (insertError) {
      console.error('Error creating withdrawal request:', insertError);
      return { success: false, error: 'Erreur lors de la création de la demande' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in requestWithdrawal:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}
