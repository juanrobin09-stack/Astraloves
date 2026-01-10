import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all shadow-lg"
      title="Déconnexion"
    >
      <LogOut className="w-5 h-5 text-white" />
    </button>
  );
}
