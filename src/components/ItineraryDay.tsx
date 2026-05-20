import React from 'react';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { Activity } from '../data/itinerary';

interface ItineraryDayProps {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
}

const ItineraryDay: React.FC<ItineraryDayProps> = ({ activities, onSelect }) => (
  <div className="space-y-3">
    {activities.map((act, i) => (
      <button
        key={act.id}
        onClick={() => onSelect(act)}
        className="w-full bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left flex items-center gap-3"
      >
        <div className="bg-blue-100 text-blue-700 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm shrink-0">
          {i + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{act.name}</h4>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            {act.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{act.time}</span>}
            {act.duration && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{act.duration}</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
      </button>
    ))}
  </div>
);

export default ItineraryDay;
