import React from 'react';
import { Lightbulb } from 'lucide-react';
import { TipItem } from '../data/itinerary';

interface Props {
  tips: TipItem[];
  showTips?: boolean;
}

const TipsSection: React.FC<Props> = ({ tips, showTips }) => {
  if (!showTips || tips.length === 0) return null;

  return (
    <div className="bg-white/90 rounded-2xl p-4 sm:p-8 shadow-lg border border-blue-100">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
        <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Tips Perjalanan</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {tips.map(tip => (
          <div key={tip.id} className="bg-blue-50 rounded-xl p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl mb-2">{tip.icon}</div>
            <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{tip.title}</h4>
            <p className="text-xs sm:text-sm text-gray-600">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsSection;
