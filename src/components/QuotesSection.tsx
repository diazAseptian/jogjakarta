import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

const QuotesSection: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    {
      text: "Kerja kerasmu hari ini adalah fondasi kesuksesanmu esok hari. Terus semangat! 🔥",
      author: "Dari yang selalu mendukungmu"
    },
    {
      text: "Setiap tugas yang kamu selesaikan adalah bukti betapa hebatnya kamu 💼",
      author: "Dengan bangga dan cinta"
    },
    {
      text: "Ketika lelah menyapa, ingatlah betapa jauh kamu sudah melangkah 💪",
      author: "Dari hati yang paling dalam"
    },
    {
      text: "Produktivitasmu hari ini mencerminkan betapa luar biasanya dirimu 🏆",
      author: "Yang selalu percaya padamu"
    },
    {
      text: "Tidak ada kerja keras yang sia-sia. Semuanya akan terbayar lunas! ⭐",
      author: "Pacarmu yang paling sayang"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="bg-gradient-to-br from-yellow-100/80 via-orange-100/80 to-red-100/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-200">
      <div className="text-center mb-8">
        <Quote className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800">Kata-kata Semangat Kerja</h3>
        <p className="text-gray-600 mt-2">Khusus untukmu, sayangku</p>
      </div>

      <div className="relative min-h-[120px] flex items-center justify-center">
        <div
          key={currentQuote}
          className="text-center animate-in fade-in duration-1000 slide-in-from-bottom"
        >
          <blockquote className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed mb-4 italic">
            "{quotes[currentQuote].text}"
          </blockquote>
          <cite className="text-orange-600 font-semibold">
            — {quotes[currentQuote].author}
          </cite>
        </div>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {quotes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuote(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentQuote === index
                ? 'bg-orange-500 shadow-lg scale-110'
                : 'bg-orange-200 hover:bg-orange-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuotesSection;
