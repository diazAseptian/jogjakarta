import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

const QuotesSection: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    {
      text: "Kamu pasti bisa, cintaku! Aku percaya pada kemampuanmu yang luar biasa ✨",
      author: "Dari hati yang paling dalam"
    },
    {
      text: "Setiap usaha yang kamu lakukan hari ini akan membawa hasil yang manis besok 🌟",
      author: "Motivasi dari pacarmu"
    },
    {
      text: "Ketika kamu merasa lelah, ingatlah bahwa aku selalu di sini mendukungmu 💪",
      author: "Dengan cinta tanpa batas"
    },
    {
      text: "Ujian ini hanya sementara, tapi kebanggaanku padamu akan selamanya 🏆",
      author: "Pacarmu yang paling sayang"
    },
    {
      text: "Kamu bukan hanya cantik, tapi juga cerdas dan kuat. Buktikan itu! 👑",
      author: "Yang selalu percaya padamu"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="bg-gradient-to-br from-pink-100/80 via-purple-100/80 to-blue-100/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-200">
      <div className="text-center mb-8">
        <Quote className="w-12 h-12 text-pink-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800">Kata-kata Semangat</h3>
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
          <cite className="text-pink-600 font-semibold">
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
                ? 'bg-pink-500 shadow-lg scale-110'
                : 'bg-pink-200 hover:bg-pink-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuotesSection;