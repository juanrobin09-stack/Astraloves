import { horoscopes } from '../../lib/astroData';
import { useEffect, useState } from 'react';

interface HoroscopeCardProps {
  sign: string;
}

export default function HoroscopeCard({ sign }: HoroscopeCardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [currentDate]);

  const horoscope = horoscopes[sign] || horoscopes["Bélier"];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl p-3 sm:p-5">
      <div className="flex justify-between items-center mb-4 gap-2">
        <span className="text-white/50 text-[10px] sm:text-xs break-words">{formatDate(currentDate)}</span>
        <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-red-600/20 text-red-400 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
          {horoscope.mood}
        </span>
      </div>

      <p className="text-white/90 text-xs sm:text-base leading-relaxed mb-4 break-words">
        {horoscope.text}
      </p>

      <div className="bg-red-600/10 rounded-xl p-3 sm:p-4">
        <span className="text-red-500 font-bold text-xs sm:text-sm block mb-2 break-words">💝 En amour :</span>
        <p className="text-white/80 text-xs sm:text-sm leading-relaxed break-words">{horoscope.love}</p>
      </div>
    </div>
  );
}
