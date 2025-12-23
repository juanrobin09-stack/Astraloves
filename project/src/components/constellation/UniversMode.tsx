import UniverseScreen from '../UniverseScreen';

interface UniversModeProps {
  userTier?: string;
  onNavigate?: (page: string) => void;
}

export default function UniversMode({ userTier = 'free', onNavigate }: UniversModeProps) {
  const mappedTier = userTier === 'premium_elite' ? 'elite' : (userTier as 'free' | 'premium' | 'elite');

  return <UniverseScreen userTier={mappedTier} onNavigate={onNavigate} />;
}
