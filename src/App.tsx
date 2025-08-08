import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Star, Sparkles } from 'lucide-react';
import CountdownTimer from './components/CountdownTimer';
import MusicPlayer from './components/MusicPlayer';
import LoveLetterModal from './components/LoveLetterModal';
import PhotoGallery from './components/PhotoGallery';
import QuotesSection from './components/QuotesSection';
import ConfettiEffect from './components/ConfettiEffect';
import VirtualHugModal from './components/VirtualHugModal';

function App() {
  const [showLoveLetter, setShowLoveLetter] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showHugPopup, setShowHugPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(true);
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleVirtualHug = () => {
    setShowHugPopup(true);
    setShowConfetti(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <ConfettiEffect trigger={showConfetti} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-purple-200/20 to-blue-200/20" />

        <div className={`relative max-w-4xl mx-auto text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-pink-500 animate-pulse mr-4" />
              <BookOpen className="w-16 h-16 text-purple-500 animate-bounce" />
              <Star className="w-12 h-12 text-blue-500 animate-pulse ml-4" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-6 leading-tight">
              Semangat Ujiannya,<br />
              <span className="text-pink-500">Sayangku!</span> 💖
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
              You've got this, my love. Don't be afraid — you're not alone, I'm always here for you.
            </p>
            
      {/* Music Player Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-100/50 to-purple-100/50">
        <div className="max-w-md mx-auto">
          <MusicPlayer />
        </div>
      </section>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowLoveLetter(true)}
                className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                💌 Baca Surat Cinta
              </button>
              <button
                onClick={handleVirtualHug}
                className="bg-white hover:bg-pink-50 text-purple-600 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-purple-200"
              >
                🤗 Peluk Virtual
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Countdown Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Hitung Mundur Menuju <span className="text-pink-500">Suksesmu!</span>
            </h2>
            <p className="text-lg text-gray-600">12 Agustus 2025, 08:00 WIB</p>
          </div>
          <CountdownTimer />
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50">
        <div className="max-w-4xl mx-auto">
          <PhotoGallery />
        </div>
      </section>

      {/* Quotes Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <QuotesSection />
        </div>
      </section>



      {/* Final Motivation Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-100">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Aku Selalu di <span className="text-pink-500">Belakangmu!</span>
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Tidak peduli seberapa sulit ujiannya, aku percaya kamu memiliki semua yang dibutuhkan untuk berhasil. 
              Kecerdasan, ketekunan, dan semangat juangmu akan membawa kamu meraih mimpi-mimpimu.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-pink-50 rounded-xl p-6">
                <div className="text-4xl mb-3">🧠</div>
                <h3 className="font-semibold text-gray-800 mb-2">Kamu Cerdas</h3>
                <p className="text-sm text-gray-600">Otakmu yang brillian pasti bisa menjawab semua soal</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-4xl mb-3">💪</div>
                <h3 className="font-semibold text-gray-800 mb-2">Kamu Kuat</h3>
                <p className="text-sm text-gray-600">Mental dan fisikmu siap menghadapi tantangan apapun</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-semibold text-gray-800 mb-2">Kamu Istimewa</h3>
                <p className="text-sm text-gray-600">Keunikan dan bakatmu akan bersinar terang</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg font-semibold mb-2">
            Dibuat dengan ❤️ penuh cinta dan harapan
          </p>
          <p className="text-pink-100">
            Untuk orang tersayang yang selalu membuatku bangga 🌟
          </p>
        </div>
      </footer>

      {/* Modals */}
      <LoveLetterModal 
        isOpen={showLoveLetter} 
        onClose={() => setShowLoveLetter(false)} 
      />

      <VirtualHugModal
        isOpen={showHugPopup}
        onClose={() => setShowHugPopup(false)}
      />
    </div>
  );
}

export default App;
