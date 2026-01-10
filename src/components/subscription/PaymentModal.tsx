import { motion } from 'framer-motion';
import { X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaymentModalProps {
  tier: 'premium' | 'elite';
  billingPeriod: 'monthly' | 'yearly';
  onClose: () => void;
}

export function PaymentModal({ tier, billingPeriod, onClose }: PaymentModalProps) {
  const amount = tier === 'premium' 
    ? (billingPeriod === 'monthly' ? '9,99€' : '99,90€')
    : (billingPeriod === 'monthly' ? '14,99€' : '149,90€');

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="glass-effect rounded-large p-8 max-w-md w-full" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold">Paiement {tier.toUpperCase()}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <div className="mb-6 p-4 bg-white/5 rounded-medium">
          <div className="flex justify-between mb-2"><span>Abonnement</span><span className="font-bold">{tier.toUpperCase()}</span></div>
          <div className="flex justify-between mb-2"><span>Période</span><span>{billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}</span></div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10"><span>Total</span><span className="text-cosmic-gold">{amount}</span></div>
        </div>
        <div className="space-y-4 mb-6">
          <input type="text" placeholder="Numéro de carte" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium" />
          <div className="flex gap-3">
            <input type="text" placeholder="MM/AA" className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-medium" />
            <input type="text" placeholder="CVC" className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-medium" />
          </div>
        </div>
        <Button variant="primary" className="w-full mb-3"><CreditCard className="w-4 h-4 mr-2" />Confirmer le paiement</Button>
        <p className="text-xs text-center text-white/60">Paiement sécurisé par Stripe. 7 jours satisfait ou remboursé.</p>
      </motion.div>
    </motion.div>
  );
}
