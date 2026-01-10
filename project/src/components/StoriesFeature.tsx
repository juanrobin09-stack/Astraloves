import { useState, useEffect, useRef } from 'react';
import { X, Heart, Star, Flame, Send, Crown, Plus, Lock } from 'lucide-react';
import { getActiveStories, viewStory, reactToStory, replyToStory, checkUserPremium, Story, formatTimeAgo } from '../lib/stories';

interface StoriesFeatureProps {
  currentUserId: string;
  isPremium: boolean;
}

export default function StoriesFeature({ currentUserId, isPremium }: StoriesFeatureProps) {
  const [storiesGroups, setStoriesGroups] = useState<{ [userId: string]: Story[] }>({});
  const [selectedStories, setSelectedStories] = useState<Story[] | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const progressTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadStories();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedStories && selectedStories[currentStoryIndex]) {
      viewStory(selectedStories[currentStoryIndex].id, currentUserId);
      startProgress();
    }

    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, [selectedStories, currentStoryIndex]);

  const loadStories = async () => {
    setLoading(true);
    const stories = await getActiveStories(currentUserId);
    setStoriesGroups(stories);
    setLoading(false);
  };

  const startProgress = () => {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }

    const duration = selectedStories?.[currentStoryIndex]?.duration || 5;
    progressTimeoutRef.current = setTimeout(() => {
      handleNext();
    }, duration * 1000);
  };

  const handleStoryClick = (userId: string) => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }

    const stories = storiesGroups[userId];
    if (stories && stories.length > 0) {
      setSelectedStories(stories);
      setCurrentStoryIndex(0);
    }
  };

  const handleNext = () => {
    if (!selectedStories) return;

    if (currentStoryIndex < selectedStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      const userIds = Object.keys(storiesGroups);
      const currentUserId = selectedStories[0].user_id;
      const currentUserIndex = userIds.indexOf(currentUserId);

      if (currentUserIndex < userIds.length - 1) {
        const nextUserId = userIds[currentUserIndex + 1];
        setSelectedStories(storiesGroups[nextUserId]);
        setCurrentStoryIndex(0);
      } else {
        closeViewer();
      }
    }
  };

  const handlePrevious = () => {
    if (!selectedStories) return;

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const closeViewer = () => {
    setSelectedStories(null);
    setCurrentStoryIndex(0);
    setReplyText('');
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
  };

  const handleReaction = async (reaction: 'heart' | 'star' | 'fire') => {
    if (!selectedStories) return;
    const story = selectedStories[currentStoryIndex];
    await reactToStory(story.id, currentUserId, reaction);
  };

  const handleReply = async () => {
    if (!selectedStories || !replyText.trim()) return;

    const story = selectedStories[currentStoryIndex];
    await replyToStory(story.id, currentUserId, story.user_id, replyText);
    setReplyText('');
  };

  const userEntries = Object.entries(storiesGroups);

  return (
    <div className="stories-feature">
      <div className="stories-header">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-red-500" />
          Stories Stellaires
        </h2>
        {!isPremium && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Crown className="w-4 h-4 text-red-500" />
            Premium uniquement
          </div>
        )}
      </div>

      {loading ? (
        <div className="stories-loading">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="stories-scroll">
          <button
            onClick={() => setShowPremiumModal(true)}
            className="story-circle"
          >
            <div className="story-avatar-add">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <span className="story-username">Ta story</span>
          </button>

          {userEntries.map(([userId, stories]) => {
            const hasUnviewed = stories.some(s => !s.viewed);
            const firstStory = stories[0];
            const userProfile = firstStory.user_profile;

            return (
              <button
                key={userId}
                onClick={() => handleStoryClick(userId)}
                className="story-circle"
              >
                <div className={`story-avatar ${hasUnviewed ? 'unviewed' : 'viewed'}`}>
                  {userProfile?.photos?.[0] ? (
                    <img src={userProfile.photos[0]} alt={userProfile.username} />
                  ) : (
                    <div className="story-avatar-placeholder">
                      {userProfile?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  {userProfile?.is_premium && (
                    <div className="story-premium-badge">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <span className="story-username">
                  {userProfile?.username || 'Utilisateur'}
                </span>
                {hasUnviewed && <div className="story-indicator" />}
              </button>
            );
          })}

          {userEntries.length === 0 && !loading && (
            <div className="stories-empty">
              <Star className="w-12 h-12 text-gray-600 mb-2" />
              <p className="text-gray-500 text-sm">Aucune story pour le moment</p>
            </div>
          )}
        </div>
      )}

      {selectedStories && (
        <div className="story-viewer" onClick={closeViewer}>
          <div className="story-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeViewer} className="story-close">
              <X className="w-6 h-6" />
            </button>

            <div className="story-progress">
              {selectedStories.map((_, index) => (
                <div key={index} className="progress-segment">
                  {index < currentStoryIndex && (
                    <div className="progress-fill" style={{ width: '100%' }} />
                  )}
                  {index === currentStoryIndex && (
                    <div className="progress-fill progress-active" />
                  )}
                </div>
              ))}
            </div>

            <div className="story-header-info">
              <div className="flex items-center gap-3">
                <div className="story-avatar-small">
                  {selectedStories[currentStoryIndex].user_profile?.photos?.[0] ? (
                    <img src={selectedStories[currentStoryIndex].user_profile.photos[0]} alt="" />
                  ) : (
                    <div className="story-avatar-placeholder">
                      {selectedStories[currentStoryIndex].user_profile?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">
                      @{selectedStories[currentStoryIndex].user_profile?.username}
                    </span>
                    {selectedStories[currentStoryIndex].user_profile?.is_premium && (
                      <Crown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <span className="text-gray-400 text-xs">
                    {formatTimeAgo(selectedStories[currentStoryIndex].created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="story-tap-areas">
              <div className="story-tap-left" onClick={handlePrevious} />
              <div className="story-tap-right" onClick={handleNext} />
            </div>

            {selectedStories[currentStoryIndex].type === 'photo' ? (
              <img
                src={selectedStories[currentStoryIndex].media_url}
                alt="Story"
                className="story-media"
              />
            ) : (
              <video
                src={selectedStories[currentStoryIndex].media_url}
                className="story-media"
                autoPlay
                muted
                playsInline
              />
            )}

            {selectedStories[currentStoryIndex].text_content && (
              <div
                className="story-text-overlay"
                style={{
                  color: selectedStories[currentStoryIndex].text_color,
                  top: `${selectedStories[currentStoryIndex].text_position.y * 100}%`,
                  left: `${selectedStories[currentStoryIndex].text_position.x * 100}%`,
                }}
              >
                {selectedStories[currentStoryIndex].text_content}
              </div>
            )}

            <div className="story-reactions">
              <button onClick={() => handleReaction('heart')} className="reaction-btn">
                <Heart className="w-6 h-6" />
              </button>
              <button onClick={() => handleReaction('star')} className="reaction-btn">
                <Star className="w-6 h-6" />
              </button>
              <button onClick={() => handleReaction('fire')} className="reaction-btn">
                <Flame className="w-6 h-6" />
              </button>
            </div>

            <div className="story-reply">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                placeholder="Répondre..."
                className="story-reply-input"
              />
              <button onClick={handleReply} className="story-reply-send">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showPremiumModal && (
        <div className="modal-mobile" onClick={() => setShowPremiumModal(false)}>
          <div className="modal-content-mobile" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#252525] border border-[#2a2a2a] text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/30 mb-4">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Stories réservées Premium</h2>
              <p className="text-gray-400 text-sm">Accède aux Stories stellaires avec Premium</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-bold text-white">Avec Premium</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Publier des stories 24h</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Voir les stories des autres</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Répondre aux stories</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Stickers astro exclusifs</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Voir qui a vu ta story</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => (window.location.href = '/premium')}
              className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all mb-3 flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Passer Premium - 9,99€/mois
            </button>

            <button
              onClick={() => setShowPremiumModal(false)}
              className="w-full h-12 bg-[#252525] border border-[#2a2a2a] text-gray-400 hover:text-white font-medium rounded-2xl transition-all"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
