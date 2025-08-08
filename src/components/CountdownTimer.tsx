import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target date: August 12, 2025 08:00 WIB
    const targetDate = new Date('2025-08-12T08:00:00+07:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-100">
      <div className="flex items-center justify-center mb-6">
        <Clock className="w-8 h-8 text-pink-500 mr-3" />
        <h3 className="text-2xl font-bold text-gray-800">Countdown Ujianmu</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-pink-600 mb-1">{timeLeft.days}</div>
          <div className="text-sm text-pink-500 font-medium">Hari</div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-600 mb-1">{timeLeft.hours}</div>
          <div className="text-sm text-blue-500 font-medium">Jam</div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-600 mb-1">{timeLeft.minutes}</div>
          <div className="text-sm text-purple-500 font-medium">Menit</div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-600 mb-1">{timeLeft.seconds}</div>
          <div className="text-sm text-orange-500 font-medium">Detik</div>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-lg text-gray-700 font-medium">
          Aku yakin kamu pasti <span className="text-pink-500 font-bold">BISA</span>! 💪✨
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;