interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnline?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

const onlineDotSizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
};

export default function Avatar({
  src,
  name,
  size = 'md',
  className = '',
  showOnline = false,
  isOnline = false,
}: AvatarProps) {
  const getInitial = () => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getGradient = () => {
    const gradients = [
      'from-red-600 to-red-700',
      'from-pink-600 to-pink-700',
      'from-purple-600 to-purple-700',
      'from-blue-600 to-blue-700',
      'from-green-600 to-green-700',
      'from-yellow-600 to-yellow-700',
      'from-orange-600 to-orange-700',
    ];

    const initial = name?.charAt(0).toLowerCase() || 'a';
    const index = initial.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-red-900/30`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-black flex items-center justify-center text-white font-bold border-2 border-red-900/30`}
        >
          {getInitial()}
        </div>
      )}

      {showOnline && (
        <div
          className={`absolute bottom-0 right-0 ${onlineDotSizes[size]} rounded-full border-2 border-gray-900 ${
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          }`}
        />
      )}
    </div>
  );
}
