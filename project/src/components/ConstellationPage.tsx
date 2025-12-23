import UniverseScreen from './UniverseScreen';

interface ConstellationPageProps {
  onNavigate?: (page: string) => void;
}

export default function ConstellationPage({ onNavigate }: ConstellationPageProps) {
  return <UniverseScreen userTier="free" onNavigate={onNavigate} />;
}
