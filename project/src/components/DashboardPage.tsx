import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Heart, Target, Sparkles, X, FileText, Crown, Edit3, CheckCircle, Compass, Users, UserPlus, TrendingUp, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getUserLimits } from '../lib/subscriptionLimits';
import MyResults from './MyResults';
import CompatibilityPage from './CompatibilityPage';
import ProfileEdit from './ProfileEdit';
import MessageCounterDisplay from './MessageCounterDisplay';
import FriendsPage from './FriendsPage';
import QuestionnairesPage from './QuestionnairesPage';

type DashboardPageProps = {
  onBack: () => void;
  onEditProfile: () => void;
  onViewResult?: (resultId: string) => void;
  onNavigate?: (page: string) => void;
};

export default function DashboardPage({ onBack, onEditProfile, onViewResult, onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showModal, setShowModal] = useState<'cgv' | 'privacy' | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'results' | 'friends' | 'questionnaires' | 'earnings' | 'live'>('profile');
  const [viewingCompatibility, setViewingCompatibility] = useState<string | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [counters, setCounters] = useState({ private_messages: 0, astra_messages: 0, swipes: 0, reset_time: new Date().toISOString() });
  const [stats, setStats] = useState({ matches: 0, avgCompatibility: 0, activeConversations: 0 });

  useEffect(() => {
    loadProfile();
    loadCounters();
    loadStats();

    const profileSubscription = supabase
      .channel('dashboard_profile_changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'astra_profiles', filter: `id=eq.${user!.id}` },
        () => {
          console.log('[Dashboard] Profile updated, reloading...');
          loadProfile();
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
    };
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('astra_profiles')
      .select('*')
      .eq('id', user!.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const loadCounters = async () => {
    // Charger depuis astra_profiles car c'est là que sont stockés les compteurs
    const { data: profileData } = await supabase
      .from('astra_profiles')
      .select('daily_astra_messages, daily_swipes')
      .eq('id', user!.id)
      .maybeSingle();

    const { data: messageData } = await supabase
      .from('daily_messages')
      .select('count')
      .eq('user_id', user!.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    setCounters({
      private_messages: messageData?.count || 0,
      astra_messages: profileData?.daily_astra_messages || 0,
      swipes: profileData?.daily_swipes || 0,
      reset_time: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
    });
  };

  const loadStats = async () => {
    const { data: matchesData } = await supabase.from('matches').select('*').eq('user_id', user!.id);
    const { data: conversationsData } = await supabase.from('user_conversations').select('*').eq('user_id', user!.id);
    setStats({
      matches: matchesData?.length || 0,
      avgCompatibility: 87,
      activeConversations: conversationsData?.length || 0,
    });
  };

  const calculateCompletion = () => {
    const fields = [profile.first_name, profile.age, profile.gender, profile.avatar_url, profile.birth_date, profile.birth_time, profile.sun_sign];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const getMissingFields = () => {
    const missing = [];
    if (!profile.birth_time) missing.push('Heure de naissance');
    if (!profile.avatar_url) missing.push('Photo de profil');
    if (!profile.sun_sign) missing.push('Signe astrologique');
    return missing;
  };

  const getResetTime = () => {
    const now = new Date();
    const reset = new Date(counters.reset_time);
    reset.setHours(reset.getHours() + 24);
    const diff = reset.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  if (!profile) {
    return (
      <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center">
        <div className="stars-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-y-auto overflow-x-hidden">
      <div className="stars-bg fixed inset-0 opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-md sm:max-w-2xl mx-auto px-4 py-6 pb-28">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">Retour au chat</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Mon Profil
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Consulte tes informations et tes résultats
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all text-base min-h-[44px] ${
              activeTab === 'profile'
                ? 'bg-[#E91E63] text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="whitespace-nowrap">Profil</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'results'
                ? 'bg-[#E91E63] text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Résultats</span>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'friends'
                ? 'bg-[#E91E63] text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Amis</span>
          </button>
          <button
            onClick={() => setActiveTab('questionnaires')}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'questionnaires'
                ? 'bg-[#E91E63] text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Questionnaires</span>
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'earnings'
                ? 'bg-[#E91E63] text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Gains</span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
              activeTab === 'live'
                ? 'bg-[#E91E63] text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Live</span>
          </button>
        </div>

        {activeTab === 'profile' && (
        <div className="space-y-4">
          <style>{`
            .profile-photo-wrapper {
              position: relative;
              width: 120px;
              height: 120px;
              max-width: 140px;
              margin: 0 auto;
              border-radius: 50%;
              padding: 4px;
              background: linear-gradient(135deg, #ef4444, #dc2626, #ef4444);
              background-size: 200% 200%;
              cursor: pointer;
              transition: all 0.3s;
              animation: rotate-gradient 3s linear infinite;
            }
            @media (min-width: 640px) {
              .profile-photo-wrapper {
                width: 140px;
                height: 140px;
              }
            }
            @keyframes rotate-gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .profile-photo-wrapper:hover {
              transform: scale(1.05);
              box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
            }
            .profile-photo-inner {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: #1a1a1a;
              overflow: hidden;
              position: relative;
            }
            .photo-overlay {
              position: absolute;
              inset: 0;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              opacity: 0;
              transition: opacity 0.3s;
            }
            .profile-photo-wrapper:hover .photo-overlay {
              opacity: 1;
            }
            .progress-bar {
              height: 10px;
              background: #2a2a2a;
              border-radius: 5px;
              overflow: hidden;
              margin: 12px 0;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #ef4444, #dc2626);
              transition: width 0.5s ease;
              animation: shimmer 2s infinite;
            }
            @keyframes shimmer {
              0% { opacity: 1; }
              50% { opacity: 0.8; }
              100% { opacity: 1; }
            }
            .usage-bar {
              height: 8px;
              background: #2a2a2a;
              border-radius: 4px;
              overflow: hidden;
              margin-top: 8px;
            }
            .usage-bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #ef4444, #dc2626);
              transition: width 0.3s;
            }
          `}</style>

          {/* Photo de profil */}
          <div className="bg-black/50 backdrop-blur-lg border border-red-600/30 rounded-2xl p-6 text-center">
            <label className="profile-photo-wrapper inline-block cursor-pointer">
              <div className="profile-photo-inner">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    👤
                  </div>
                )}
                <div className="photo-overlay">
                  <Edit3 className="w-6 h-6 mb-1" />
                  <span className="text-sm">📷 Modifier</span>
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" />
            </label>

            <h2 className="text-white text-2xl font-bold mt-6 mb-2">
              {profile.first_name || 'Utilisateur'}, {profile.age || '?'} ans
            </h2>
            <p className="text-gray-400 mb-1">
              ⭐ {profile.sun_sign || 'Non défini'} • Paris
            </p>
            <p className="text-[#ef4444] font-medium">
              @{profile.first_name?.toLowerCase() || 'user'}_{profile.sun_sign?.toLowerCase() || 'astra'} {profile.is_premium && '💎'}
            </p>
          </div>

          {/* Barre de complétion */}
          <div className="bg-black/50 backdrop-blur-lg border border-red-600/30 rounded-2xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">
              📊 Profil complété à {calculateCompletion()}%
            </h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${calculateCompletion()}%` }} />
            </div>
            {calculateCompletion() < 100 && getMissingFields().length > 0 && (
              <div className="mt-4 p-4 bg-[#252525] rounded-xl">
                <p className="text-gray-400 text-sm mb-2">Manque encore :</p>
                <ul className="space-y-1 mb-4">
                  {getMissingFields().map((field: string, idx: number) => (
                    <li key={idx} className="text-gray-500 text-sm pl-4 relative">
                      <span className="absolute left-0 text-[#ef4444]">•</span>
                      {field}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="w-full px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg font-semibold transition-colors"
                >
                  Compléter maintenant
                </button>
              </div>
            )}
          </div>

          {/* Abonnement */}
          <div className="bg-black/50 backdrop-blur-lg border border-red-600/30 rounded-2xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">💎 Mon Abonnement</h3>
            {profile.is_premium ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-yellow-500 font-bold">💎 Premium actif</span>
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">Actif</span>
                </div>
                {profile.current_period_end && (
                  <p className="text-gray-400 text-sm mb-4">
                    Prochain paiement : {new Date(profile.current_period_end).toLocaleDateString('fr-FR')}
                  </p>
                )}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">💬 Messages privés</span>
                      <span className="text-white font-semibold">{counters.private_messages}/10</span>
                    </div>
                    <div className="usage-bar">
                      <div className="usage-bar-fill" style={{ width: `${(counters.private_messages / 10) * 100}%` }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Reset dans {getResetTime()}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">⭐ Messages Astra</span>
                      <span className="text-white font-semibold">
                        {counters.astra_messages}/{getUserLimits(profile?.premium_tier).astraMessagesPerDay}
                      </span>
                    </div>
                    <div className="usage-bar">
                      <div className="usage-bar-fill bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${(counters.astra_messages / getUserLimits(profile?.premium_tier).astraMessagesPerDay) * 100}%` }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Reset dans {getResetTime()}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">❤️ Swipes</span>
                      <span className="text-white font-semibold">∞</span>
                    </div>
                    <div className="usage-bar">
                      <div className="usage-bar-fill bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '100%' }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Illimité pour Premium/Elite</p>
                  </div>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('premium')}
                    className="w-full mt-4 px-4 py-2 bg-[#252525] hover:bg-[#2a2a2a] text-white rounded-lg font-semibold transition-colors"
                  >
                    📄 Gérer mon abonnement
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-white font-bold">🆓 Compte Gratuit</p>
                  <span className="px-3 py-1 bg-green-500/20 text-green-500 text-sm font-bold rounded-full">Actif</span>
                </div>
                <div className="space-y-4 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">💬 Messages privés</span>
                      <span className="text-white font-semibold">
                        {counters.private_messages}/5 {counters.private_messages >= 4 && '⚠️'}
                      </span>
                    </div>
                    <div className="usage-bar">
                      <div className="usage-bar-fill" style={{ width: `${(counters.private_messages / 5) * 100}%` }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Reset dans {getResetTime()}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">⭐ Messages Astra</span>
                      <span className="text-white font-semibold">
                        {counters.astra_messages}/{getUserLimits(profile?.premium_tier).astraMessagesPerDay}
                      </span>
                    </div>
                    <div className="usage-bar">
                      <div className="usage-bar-fill" style={{ width: `${(counters.astra_messages / getUserLimits(profile?.premium_tier).astraMessagesPerDay) * 100}%` }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Reset dans {getResetTime()}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">❤️ Swipes</span>
                      <span className="text-white font-semibold">
                        {counters.swipes}/5 {counters.swipes >= 4 && '⚠️'}
                      </span>
                    </div>
                    <div className="usage-bar">
                      <div className="usage-bar-fill" style={{ width: `${(counters.swipes / 5) * 100}%` }} />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Reset demain 00h00</p>
                  </div>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('premium')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#ef4444] text-white rounded-xl font-bold transition-all"
                  >
                    Passer Premium - 9,99€/mois
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="bg-black/50 backdrop-blur-lg border border-red-600/30 rounded-2xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">📊 Mes Statistiques</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-[#ef4444]">•</span>
                <span>{stats.matches} matchs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#ef4444]">•</span>
                <span>{stats.avgCompatibility}% compatibilité moyenne</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#ef4444]">•</span>
                <span>{stats.activeConversations} conversations actives</span>
              </li>
            </ul>
          </div>
        </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-black/50 backdrop-blur-lg border border-red-600/30 rounded-2xl p-6">
            <MyResults onViewResult={(resultId) => onViewResult?.(resultId)} />
          </div>
        )}

        {activeTab === 'friends' && (
          <FriendsPage
            onBack={() => setActiveTab('profile')}
            onMessage={(userId) => {
              if (onNavigate) {
                onNavigate('messages');
              }
            }}
          />
        )}

        {activeTab === 'questionnaires' && (
          <QuestionnairesPage
            onBack={() => setActiveTab('profile')}
            onStartQuestionnaire={(questionnaireId) => {
              if (onNavigate) {
                onNavigate(`questionnaire-${questionnaireId}`);
              }
            }}
            onNavigate={onNavigate}
            onViewResult={onViewResult}
          />
        )}

        {activeTab === 'earnings' && (
          <EarningsTab userId={user!.id} profile={profile} />
        )}

        {activeTab === 'live' && (
          <LiveTab userId={user!.id} profile={profile} onNavigate={onNavigate} />
        )}

      </div>

      {viewingCompatibility && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <CompatibilityPage
            matchUserId={viewingCompatibility}
            onBack={() => setViewingCompatibility(null)}
          />
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(null);
          }}
        >
          <div
            className="bg-black/90 border border-red-600/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(null);
              }}
              className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {showModal === 'privacy' && (
              <div className="text-white space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">Politique de confidentialité</h2>
                <p className="text-gray-300">17 novembre 2025</p>
                <p className="text-white">Nous collectons : ton email, prénom, date de naissance, réponses aux questionnaires, historique de conversation.</p>
                <p className="text-white">Finalité : fonctionnement du service et personnalisation de l'IA.</p>
                <p className="text-white">Durée de conservation : tant que ton compte existe + 30 jours après suppression.</p>
                <p className="text-white">Tes droits RGPD : accès, rectification, suppression, opposition → envoie un mail à astra.loveai@gmail.com</p>
                <p className="text-white">Hébergeur : Supabase (Irlande – conformité RGPD) et Netlify (USA – Privacy Shield + DPA signé).</p>
                <p className="text-white">Aucun transfert hors UE sans ton accord.</p>
                <p className="text-white">DPO : astra.loveai@gmail.com</p>
                <p className="text-white font-semibold">Divertissement • 18+ • Pas de conseil médical</p>
              </div>
            )}

            {showModal === 'cgv' && (
              <div className="text-white space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">Conditions Générales de Vente</h2>
                <p className="text-white">Abonnement Premium 9,99 €/mois TTC – reconduction automatique.</p>
                <p className="text-white">Résiliation à tout moment dans la section Mon abonnement (effet immédiat, sans frais supplémentaires).</p>
                <p className="text-white">Délai de rétractation de 14 jours (remboursement intégral si demandé avant).</p>
                <p className="text-white">Paiement sécurisé par Stripe – nous n'avons jamais accès à tes données bancaires.</p>
                <p className="text-white">Service de divertissement 18+ – aucun conseil médical ou psychologique.</p>
                <p className="text-white font-semibold">Divertissement • 18+ • Pas de conseil médical</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showProfileEdit && (
        <ProfileEdit
          userId={user!.id}
          onClose={() => setShowProfileEdit(false)}
          onSave={() => {
            loadProfile();
          }}
        />
      )}
    </div>
  );
}

// Earnings Tab Component
function EarningsTab({ userId, profile }: { userId: string; profile: any }) {
  const [earnings, setEarnings] = useState(0);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarningsData();
  }, [userId]);

  const loadEarningsData = async () => {
    setLoading(true);

    try {
      const { data: userData } = await supabase
        .from('astra_profiles')
        .select('total_earnings, withdrawable_balance, is_creator')
        .eq('id', userId)
        .maybeSingle();

      if (userData) {
        setEarnings(userData.total_earnings || 0);
        setWithdrawableBalance(userData.withdrawable_balance || 0);
      }

      const { data: transactionsData } = await supabase
        .from('stars_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'gift_received')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsData) {
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white">Chargement des données...</p>
      </div>
    );
  }

  if (!profile?.is_creator) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-600/30 rounded-xl p-8">
          <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Deviens Créateur</h3>
          <p className="text-gray-300 mb-6">
            Active ton statut créateur pour gagner des étoiles et des commissions
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
            Activer le mode créateur
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-yellow-400 text-center flex items-center justify-center gap-3">
        <TrendingUp className="w-8 h-8" />
        Mes Gains et Commissions
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600/50 rounded-xl p-6">
          <div className="text-yellow-400 text-sm font-semibold mb-2">Total Gagné</div>
          <div className="text-3xl font-bold text-white">{earnings} ⭐</div>
          <div className="text-sm text-gray-400 mt-1">≈ {(earnings * 0.01).toFixed(2)}€</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-600/50 rounded-xl p-6">
          <div className="text-green-400 text-sm font-semibold mb-2">Retirable</div>
          <div className="text-3xl font-bold text-white">{withdrawableBalance.toFixed(2)}€</div>
          <div className="text-sm text-gray-400 mt-1">Min. 50€ requis</div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-gradient-to-br from-black/80 to-gray-900/80 border-2 border-red-700/50 rounded-xl p-6">
        <h3 className="font-bold text-red-400 mb-4 text-lg">Transactions Récentes</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune transaction récente</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between items-center bg-gradient-to-r from-red-900/40 to-red-900/20 rounded-lg p-4 border border-red-800/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-white">Cadeau reçu</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="text-green-400 font-bold">+{tx.creator_gain || tx.amount} ⭐</span>
                    {tx.commission_rate && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({(tx.commission_rate * 100).toFixed(0)}% commission)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {withdrawableBalance >= 50 ? (
          <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-[1.02]">
            Demander un retrait ({withdrawableBalance.toFixed(2)}€)
          </button>
        ) : (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center text-gray-400 text-sm">
            Encore {(50 - withdrawableBalance).toFixed(2)}€ à gagner pour pouvoir retirer
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
        <div className="text-sm text-blue-200">
          <p className="font-semibold mb-2">💡 Optimise tes gains :</p>
          <ul className="space-y-1 text-blue-300">
            <li>• Gratuit : 30% commission → Tu gardes 70%</li>
            <li>• Premium : 15% commission → Tu gardes 85%</li>
            <li>• Premium+ Elite : 5% commission → Tu gardes 95%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Live Tab Component
function LiveTab({ userId, profile, onNavigate }: { userId: string; profile: any; onNavigate?: (page: string) => void }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-red-400 text-center flex items-center justify-center gap-3">
        <Video className="w-8 h-8" />
        Mes Lives
      </h2>

      {!profile?.is_creator ? (
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-600/30 rounded-xl p-8 text-center">
          <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Deviens Créateur</h3>
          <p className="text-gray-300 mb-6">
            Active ton statut créateur pour lancer des Lives et gagner des étoiles
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
            Activer le mode créateur
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lancer un Live */}
          <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border-2 border-red-600/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Video className="w-6 h-6 text-red-400" />
              Lancer un Live
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Démarre un live streaming pour interagir avec ton audience et recevoir des cadeaux cosmiques
            </p>
            <button
              onClick={() => onNavigate?.('start-live')}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Démarrer un Live
            </button>
          </div>

          {/* Stats Lives */}
          <div className="bg-gradient-to-br from-black/80 to-gray-900/80 border-2 border-red-700/50 rounded-xl p-6">
            <h3 className="font-bold text-red-400 mb-4 text-lg">Statistiques Lives</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Lives réalisés</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Spectateurs total</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Cadeaux reçus</div>
              </div>
            </div>
          </div>

          {/* Historique Lives */}
          <div className="bg-gradient-to-br from-black/80 to-gray-900/80 border-2 border-gray-700/50 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 text-lg">Historique des Lives</h3>
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Aucun live pour le moment</p>
              <p className="text-gray-500 text-sm mt-2">Lance ton premier live pour apparaître ici</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
