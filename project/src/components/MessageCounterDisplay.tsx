import { MessageSquare, Crown, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMessageCounterStatus, MessageCounterStatus } from '../lib/messageCounter';
import { useAuth } from '../contexts/AuthContext';

interface MessageCounterDisplayProps {
  onUpgrade?: () => void;
  compact?: boolean;
}

export default function MessageCounterDisplay({ onUpgrade, compact = false }: MessageCounterDisplayProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<MessageCounterStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const loadStatus = async () => {
    if (!user) return;

    try {
      const data = await getMessageCounterStatus(user.id);
      setStatus(data);
    } catch (error) {
      console.error('Error loading message counter:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status) {
    return null;
  }

  const percentage = (status.current / status.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = status.remaining === 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <span className={`font-medium ${isNearLimit ? 'text-orange-400' : 'text-gray-300'}`}>
          {status.current}/{status.limit}
        </span>
        {status.is_premium && (
          <Crown className="w-4 h-4 text-yellow-400" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-medium">Messages</span>
          {status.is_premium && (
            <div className="flex items-center gap-1 bg-yellow-600/20 px-2 py-0.5 rounded-full">
              <Crown className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">Premium</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-orange-400' : 'text-white'}`}>
            {status.remaining}/{status.limit}
          </p>
          <p className="text-xs text-gray-400">restants</p>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ${
            isAtLimit
              ? 'bg-gradient-to-r from-red-600 to-red-500'
              : isNearLimit
              ? 'bg-gradient-to-r from-orange-600 to-orange-500'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isAtLimit && status.reset_in_hours !== undefined && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm font-medium mb-1">
                Limite quotidienne atteinte
              </p>
              <p className="text-gray-400 text-xs">
                Prochain reset dans {Math.ceil(status.reset_in_hours)}h
              </p>
            </div>
          </div>
        </div>
      )}

      {!status.is_premium && isNearLimit && (
        <button
          onClick={onUpgrade}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <Crown className="w-4 h-4" />
          Passe à 30 messages/jour
        </button>
      )}

      {status.is_premium && (
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Reset glissant : {status.reset_in_hours !== undefined ? `${Math.ceil(status.reset_in_hours)}h` : '24h'}
          </p>
        </div>
      )}
    </div>
  );
}
