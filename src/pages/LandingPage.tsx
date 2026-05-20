import React, { useState } from 'react';
import { MapPin, Calendar, Users, Wallet, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '../data/itinerary';
import { useItineraryLive } from '../hooks/useItinerary';
import ItineraryDay from '../components/ItineraryDay';
import DetailModal from '../components/DetailModal';
import TipsSection from '../components/TipsSection';

const dayColors = [
  { bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  { bg: 'bg-teal-500', light: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600' },
  { bg: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
  { bg: 'bg-rose-500', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { data, loading } = useItineraryLive();
  const { tripInfo, days } = data;
  const [activeDay, setActiveDay] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const color = dayColors[activeDay % dayColors.length];
  const nightCount = Math.max(0, days.length - 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Memuat itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="relative text-white py-16 px-4 text-center overflow-hidden"
        style={!data.settings?.headerImage ? { background: 'linear-gradient(to right, #2563eb, #14b8a6, #9333ea)' } : {}}
      >
        {data.settings?.headerImage && (
          <>
            <img
              src={data.settings.headerImage}
              alt="header background"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Admin Login
            </button>
          </div>
          <div className="flex justify-center items-center gap-2 mb-3">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight">{tripInfo.title}</h1>
          </div>
          <p className="text-blue-100 text-base sm:text-lg mb-6 px-2">{tripInfo.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {days.length > 0 ? `${days.length} Hari ${nightCount > 0 ? `${nightCount} Malam` : ''}`.trim() : 'Belum ada jadwal'}
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {tripInfo.totalPeople}
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {tripInfo.estimateBudget}
            </div>
          </div>
        </div>
      </header>

      {/* Empty State */}
      {days.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="px-4 py-20 text-center text-gray-400">
            <p className="text-6xl mb-4">🗺️</p>
            <p className="text-xl font-semibold text-gray-600">Itinerary belum diisi</p>
            <p className="text-sm mt-2">Admin belum menambahkan jadwal perjalanan</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Day Tabs */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
            <div className="max-w-3xl mx-auto flex overflow-x-auto scrollbar-hide">
              {days.map((day, i) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(i)}
                  className={`flex-1 min-w-[80px] py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
                    activeDay === i
                      ? `${dayColors[i % dayColors.length].text} border-current`
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  <div>Hari {i + 1}</div>
                  <div className="text-xs font-normal opacity-75 truncate max-w-[80px] mx-auto">{day.theme || '—'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-8">
            <div className={`${color.light} ${color.border} border rounded-2xl p-4 sm:p-5 mb-6`}>
              <div className="flex items-center gap-3">
                <div className={`${color.bg} text-white rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-sm sm:text-base shrink-0`}>
                  Hari {activeDay + 1}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-800 text-base sm:text-lg truncate">{days[activeDay].theme || 'Tanpa tema'}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {days[activeDay].activities.length} aktivitas · Klik untuk detail
                  </p>
                </div>
              </div>
            </div>

            {days[activeDay].activities.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">Belum ada aktivitas untuk hari ini</p>
              </div>
            ) : (
              <ItineraryDay
                activities={days[activeDay].activities}
                onSelect={setSelectedActivity}
              />
            )}

            <div className="mt-8 sm:mt-10">
              <TipsSection tips={data.tips} showTips={data.settings?.showTips} />
            </div>
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-teal-500 to-purple-600 text-white py-6 px-4 text-center mt-auto">
        <p className="font-semibold">{data.settings?.footerText || '🗺️ Selamat Berlibur ke Yogyakarta!'}</p>
        <p className="text-blue-100 text-sm mt-1">{data.settings?.footerSub || 'Jangan lupa bawa kamera dan semangat petualangan ✨'}</p>
        <p className="text-white/40 text-xs mt-4">© {new Date().getFullYear()} Diaz Ahmad Septian. All rights reserved.</p>
      </footer>

      <DetailModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
      />
    </div>
  );
}
