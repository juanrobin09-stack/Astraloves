import { useState, useEffect } from 'react';
import {
  Settings, ArrowLeft, Bell, Lock, Eye, Heart,
  Globe, Trash2, LogOut, Shield,
  Mail, Smartphone, Volume2, VolumeX
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import IncognitoToggle from './IncognitoToggle';

interface SettingsPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

interface UserSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  match_notifications: boolean;
  message_notifications: boolean;
  sound_enabled: boolean;
  dark_mode: boolean;
  show_distance: boolean;
  show_last_active: boolean;
  language: string;
}

export default function SettingsPage({ onBack, onNavigate }: SettingsPageProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: true,
    match_notifications: true,
    message_notifications: true,
    sound_enabled: true,
    dark_mode: true,
    show_distance: true,
    show_last_active: true,
    language: 'fr'
  });
  const [isPremium, setIsPremium] = useState(false);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Cleanup: débloquer le scroll au montage du composant
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('height');
    document.body.style.overflow = 'auto';

    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('astra_profiles')
        .select('is_premium, incognito_mode')
        .eq('id', user.id)
        .maybeSingle();

      setIsPremium(profile?.is_premium || false);
      setIncognitoMode(profile?.incognito_mode || false);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await supabase.from('astra_profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-y-auto overflow-x-hidden pb-28">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="mb-6 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-red-500" />
            Paramètres
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Personnalise ton expérience</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-black border border-gray-200 dark:border-red-600/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-red-600/20">
              <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-500 dark:text-red-400" />
                Notifications
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Activer toutes les notifications</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => updateSetting('notifications_enabled', e.target.checked)}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 dark:bg-gray-700 checked:bg-red-600 dark:checked:bg-red-600 relative cursor-pointer transition-colors
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                    checked:before:translate-x-6"
                />
              </label>

              {settings.notifications_enabled && (
                <>
                  <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">Notifications email</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.email_notifications}
                      onChange={(e) => updateSetting('email_notifications', e.target.checked)}
                      className="w-12 h-6 rounded-full appearance-none bg-gray-300 dark:bg-gray-700 checked:bg-red-600 dark:checked:bg-red-600 relative cursor-pointer transition-colors
                        before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                        checked:before:translate-x-6"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">Notifications push</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.push_notifications}
                      onChange={(e) => updateSetting('push_notifications', e.target.checked)}
                      className="w-12 h-6 rounded-full appearance-none bg-gray-300 dark:bg-gray-700 checked:bg-red-600 dark:checked:bg-red-600 relative cursor-pointer transition-colors
                        before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                        checked:before:translate-x-6"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">Nouveaux matchs</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.match_notifications}
                      onChange={(e) => updateSetting('match_notifications', e.target.checked)}
                      className="w-12 h-6 rounded-full appearance-none bg-gray-300 dark:bg-gray-700 checked:bg-red-600 dark:checked:bg-red-600 relative cursor-pointer transition-colors
                        before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                        checked:before:translate-x-6"
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-black border border-gray-200 dark:border-red-600/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-red-600/20">
              <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-500 dark:text-red-400" />
                Confidentialité
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <IncognitoToggle
                userId={user?.id || ''}
                premiumTier={isPremium ? 'premium_elite' : 'free'}
                isIncognito={incognitoMode}
                onToggle={setIncognitoMode}
                onNavigate={onNavigate}
              />

              <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Afficher ma distance</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_distance}
                  onChange={(e) => updateSetting('show_distance', e.target.checked)}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 dark:bg-gray-700 checked:bg-red-600 dark:checked:bg-red-600 relative cursor-pointer transition-colors
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                    checked:before:translate-x-6"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Afficher ma dernière activité</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_last_active}
                  onChange={(e) => updateSetting('show_last_active', e.target.checked)}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 dark:bg-gray-700 checked:bg-red-600 dark:checked:bg-red-600 relative cursor-pointer transition-colors
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                    checked:before:translate-x-6"
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-black border border-gray-200 dark:border-red-600/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-red-600/20">
              <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                Préférences
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  {settings.sound_enabled ? (
                    <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="text-gray-900 dark:text-white">Sons et vibrations</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sound_enabled}
                  onChange={(e) => updateSetting('sound_enabled', e.target.checked)}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 dark:bg-gray-700 checked:bg-red-600 dark:checked:bg-red-600 relative cursor-pointer transition-colors
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                    checked:before:translate-x-6"
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900/90 dark:to-black border border-gray-200 dark:border-red-600/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-red-600/20">
              <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500 dark:text-red-400" />
                Sécurité
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Se déconnecter</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">→</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between p-3 bg-red-100 dark:bg-red-900/20 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors border border-red-300 dark:border-red-600/30"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Supprimer mon compte</span>
                </div>
                <span className="text-red-600 dark:text-red-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 rounded-2xl p-6 border-2 border-red-300 dark:border-red-500/30 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Supprimer le compte ?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette action est irréversible. Toutes tes données, matchs et conversations seront définitivement supprimés.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                Oui, supprimer mon compte
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 rounded-xl transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
