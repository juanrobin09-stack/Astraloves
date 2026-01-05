import { useState, useEffect } from 'react';
import { Video, Image, Clock, Users, X, AlertCircle, Crown, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface StartLivePageProps {
  onBack: () => void;
  onLiveStarted: (liveId: string) => void;
}

export default function StartLivePage({ onBack, onLiveStarted }: StartLivePageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [canGoLive, setCanGoLive] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumPlus, setIsPremiumPlus] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [scheduledFor, setScheduledFor] = useState<'now' | 'later'>('now');

  useEffect(() => {
    checkLivePermissions();
  }, [user]);

  const checkLivePermissions = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('astra_profiles')
        .select('is_premium, premium_tier')
        .eq('id', user.id)
        .maybeSingle();

      const premium = profile?.is_premium || false;
      const premiumPlus = profile?.premium_tier === 'premium_plus' || profile?.premium_tier === 'premium+elite';

      setIsPremium(premium);
      setIsPremiumPlus(premiumPlus);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayLives, error: countError } = await supabase
        .from('live_streams')
        .select('id', { count: 'exact' })
        .eq('creator_id', user.id)
        .gte('created_at', today.toISOString());

      if (countError) throw countError;

      const count = todayLives?.length || 0;
      setLiveCount(count);

      if (premiumPlus) {
        setCanGoLive(true);
      } else if (premium) {
        setCanGoLive(count < 3);
      } else {
        setCanGoLive(count < 1);
      }
    } catch (err) {
      console.error('Error checking permissions:', err);
      setError('Erreur lors de la vérification des permissions');
    } finally {
      setChecking(false);
    }
  };

  const startLive = async () => {
    if (!user || !title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!canGoLive) {
      setError('Limite de lives atteinte pour aujourd\'hui');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const streamKey = crypto.randomUUID();

      const { data: newLive, error: createError } = await supabase
        .from('live_streams')
        .insert({
          creator_id: user.id,
          title: title.trim(),
          description: description.trim(),
          thumbnail_url: thumbnailUrl.trim() || null,
          status: scheduledFor === 'now' ? 'live' : 'waiting',
          started_at: scheduledFor === 'now' ? new Date().toISOString() : null,
          stream_key: streamKey,
        })
        .select()
        .single();

      if (createError) throw createError;

      if (scheduledFor === 'now') {
        await supabase.from('live_viewers').insert({
          live_id: newLive.id,
          user_id: user.id,
        });
      }

      onLiveStarted(newLive.id);
    } catch (err: any) {
      console.error('Error starting live:', err);
      setError(err.message || 'Erreur lors du démarrage du live');
    } finally {
      setLoading(false);
    }
  };

  const getLiveLimit = () => {
    if (isPremiumPlus) return '∞ Lives illimités';
    if (isPremium) return '3 lives/jour';
    return '1 live/jour';
  };

  const getLivesRemaining = () => {
    if (isPremiumPlus) return '∞';
    if (isPremium) return Math.max(0, 3 - liveCount);
    return Math.max(0, 1 - liveCount);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Video className="w-10 h-10 text-red-500" />
              Lancer un Live
            </h1>
            <p className="text-gray-400">
              {getLiveLimit()} • Il te reste <span className="text-red-500 font-bold">{getLivesRemaining()}</span> live(s) aujourd'hui
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!canGoLive && !isPremiumPlus && (
          <div className="mb-8 bg-gradient-to-r from-red-900/30 to-red-800/30 border-2 border-red-600 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Limite atteinte</h3>
                <p className="text-gray-300 mb-4">
                  {isPremium
                    ? 'Tu as atteint ta limite de 3 lives aujourd\'hui. Passe Premium+ pour des lives illimités !'
                    : 'Tu as utilisé ton live gratuit du jour. Passe Premium pour 3 lives/jour ou Premium+ pour l\'illimité !'}
                </p>
                <button className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-bold px-6 py-3 rounded-xl transition-all">
                  Voir les plans Premium
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-3xl p-8">
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-600 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Titre du Live *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Session Q&A sur l'astrologie"
                maxLength={100}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition-colors"
                disabled={!canGoLive}
              />
              <p className="text-gray-500 text-sm mt-1">{title.length}/100 caractères</p>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décris ce que tu vas faire pendant ce live..."
                maxLength={500}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition-colors resize-none"
                disabled={!canGoLive}
              />
              <p className="text-gray-500 text-sm mt-1">{description.length}/500 caractères</p>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Image className="w-5 h-5" />
                Miniature (URL)
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition-colors"
                disabled={!canGoLive}
              />
              <p className="text-gray-500 text-sm mt-1">Optionnel - Ajoute une image d'aperçu</p>
              {thumbnailUrl && (
                <div className="mt-3 relative aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">
                Quand veux-tu lancer le live ?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setScheduledFor('now')}
                  disabled={!canGoLive}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    scheduledFor === 'now'
                      ? 'border-red-600 bg-red-900/30'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  } ${!canGoLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-bold text-white">Maintenant</span>
                  </div>
                  <p className="text-gray-400 text-sm">Démarre immédiatement</p>
                </button>

                <button
                  onClick={() => setScheduledFor('later')}
                  disabled={!canGoLive}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    scheduledFor === 'later'
                      ? 'border-yellow-600 bg-yellow-900/30'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  } ${!canGoLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-white">Plus tard</span>
                  </div>
                  <p className="text-gray-400 text-sm">Programme ton live</p>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <button
                onClick={startLive}
                disabled={!canGoLive || !title.trim() || loading}
                className={`w-full font-bold py-4 rounded-xl text-lg transition-all flex items-center justify-center gap-3 ${
                  canGoLive && title.trim() && !loading
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Préparation...
                  </>
                ) : (
                  <>
                    <Video className="w-6 h-6" />
                    {scheduledFor === 'now' ? 'Lancer le Live' : 'Programmer le Live'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {!isPremiumPlus && (
          <div className="mt-8 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-2 border-yellow-600 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-2xl flex items-center justify-center">
                  <Crown className="w-8 h-8 text-black" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  Premium+ Elite
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Lives ILLIMITÉS - Aucune limite quotidienne
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    500 étoiles offertes chaque mois
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Commission réduite à 5% sur les cadeaux
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Badge Elite visible sur ton profil
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-bold px-8 py-4 rounded-xl transition-all">
                    Passer Premium+ - 14,99€/mois
                  </button>
                  <div className="text-sm">
                    <div className="text-gray-400 line-through">19,99€</div>
                    <div className="text-yellow-500 font-bold">🎉 1er mois à 9,99€</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
