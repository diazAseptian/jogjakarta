import React from 'react';
import { X, MapPin, Clock, DollarSign } from 'lucide-react';
import { Activity } from '../data/itinerary';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, activity }) => {
  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Handle bar mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-5 h-5" />
        </button>
        <div className="p-5 sm:p-6 overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 pr-6">{activity.name}</h2>
          <div className="space-y-3 mb-4">
            {activity.time && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{activity.time}{activity.duration ? ` · ${activity.duration}` : ''}</span>
              </div>
            )}
            {activity.cost && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4 text-green-500 shrink-0" />
                <span>{activity.cost}</span>
              </div>
            )}
            {activity.address && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{activity.address}</span>
              </div>
            )}
          </div>
          {activity.description && (
            <p className="text-gray-700 text-sm leading-relaxed mb-5">{activity.description}</p>
          )}
          {activity.mapsUrl && (
            <a
              href={activity.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 text-sm"
            >
              🗺️ Buka di Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
