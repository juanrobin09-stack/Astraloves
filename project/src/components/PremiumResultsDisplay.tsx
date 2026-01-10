import { Share2, Heart } from 'lucide-react';

type PremiumResultsDisplayProps = {
  questionnaireId: string;
  questionnaireTitle: string;
  analysisText: string;
  onShare?: () => void;
  onContinue: () => void;
};

export default function PremiumResultsDisplay({
  questionnaireId,
  questionnaireTitle,
  analysisText,
  onShare,
  onContinue
}: PremiumResultsDisplayProps) {
  const mainResult = extractMainResult(analysisText, questionnaireId);
  const cleanedAnalysis = analysisText.replace(/\*\*/g, '').replace(/^[•\-*]\s*/gm, '').trim();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-black/95 border-2 border-red-900 rounded-3xl p-8 max-h-[90vh] flex flex-col">

        <div className="text-center mb-8">
          {renderHeader(mainResult, questionnaireId)}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-red-800">
          <p className="text-white/94 text-lg leading-9 font-light tracking-wide first-letter:text-5xl first-letter:text-red-500 first-letter:float-left first-letter:mr-3">
            {cleanedAnalysis}
          </p>
        </div>

        <button
          onClick={onShare}
          className="mt-8 bg-white text-black font-bold py-5 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300"
        >
          PARTAGER
        </button>
        <button
          onClick={onContinue}
          className="mt-3 bg-transparent text-gray-400 font-semibold py-3 rounded-2xl border border-gray-800 hover:text-white hover:border-red-500 transition-all"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

function renderHeader(mainResult: ReturnType<typeof extractMainResult>, questionnaireId: string) {
  switch (questionnaireId) {
    case 'attachement':
      return (
        <>
          <div className="text-7xl font-black text-red-500">
            {mainResult.percentage}%
          </div>
          <div className="text-2xl text-red-300 mt-2">
            {mainResult.label}
          </div>
        </>
      );

    case 'compatibilite':
      return (
        <>
          <div className="text-7xl font-black text-red-500 flex items-center justify-center gap-4">
            {mainResult.percentage}%
            <Heart className="w-16 h-16 fill-red-500 text-red-500" />
          </div>
          <div className="text-2xl text-red-300 mt-2">
            COMPATIBLES
          </div>
        </>
      );

    case 'archetype':
      return (
        <div className="text-5xl font-black text-red-500">
          {mainResult.label}
        </div>
      );

    case 'astral':
      return (
        <div className="text-3xl font-black text-red-400">
          {mainResult.label}
        </div>
      );

    default:
      return (
        <>
          <div className="text-7xl font-black text-red-500">
            {mainResult.percentage}%
          </div>
          <div className="text-2xl text-red-300 mt-2">
            {mainResult.label}
          </div>
        </>
      );
  }
}

function extractMainResult(text: string, questionnaireId: string): { percentage: number; label: string; subtitle?: string } {
  let percentage = 68;
  let label = 'SÉCURE';

  switch (questionnaireId) {
    case 'attachement':
      const attachMatch = text.match(/(\d+)\s*%\s*(S[ÉéEe]cure|[ÉéEe]vitant|Anxieux|D[ÉéEe]sorganis[ÉéEe])/i);
      if (attachMatch) {
        percentage = parseInt(attachMatch[1]);
        label = attachMatch[2].trim().toUpperCase();
      }
      break;

    case 'compatibilite':
      const compatMatch = text.match(/(\d+)\s*%/i);
      if (compatMatch) {
        percentage = parseInt(compatMatch[1]);
      }
      label = 'COMPATIBLES';
      break;

    case 'archetype':
      const archetypeMatch = text.match(/archétype est (?:L'|Le |La )?([A-ZÀ-ÿ][A-ZÀ-ÿa-z\sÉéèêëàâäôöûüçñ']+)/i);
      if (archetypeMatch) {
        label = archetypeMatch[1].trim().toUpperCase();
      } else {
        label = "L'AMANT PASSIONNÉ";
      }
      break;

    case 'astral':
      const venusMatch = text.match(/Vénus en ([A-ZÀ-ÿ][a-zà-ÿ]+)/i);
      const marsMatch = text.match(/Mars en ([A-ZÀ-ÿ][a-zà-ÿ]+)/i);

      if (venusMatch && marsMatch) {
        label = `Vénus ${venusMatch[1]} • Mars ${marsMatch[1]}`;
      } else if (venusMatch) {
        label = `Vénus ${venusMatch[1]}`;
      } else {
        label = 'VÉNUS SCORPION • MARS LION';
      }
      break;

    default:
      const percentMatch = text.match(/(\d+)\s*%\s*([A-ZÀ-ÿ][A-ZÀ-ÿa-z\sÉéèêëàâäôöûüçñ]+)/i);
      if (percentMatch) {
        percentage = parseInt(percentMatch[1]);
        label = percentMatch[2].trim().toUpperCase();
      }
      break;
  }

  return { percentage, label };
}
