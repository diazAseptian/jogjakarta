import React from 'react';
import { MapPin, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useItineraryLive } from '../hooks/useItinerary';

export default function LandingPage() {
  const navigate = useNavigate();
  const { data, loading } = useItineraryLive();
  const lp = data.landing;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {lp.navLogo ? (
              <img src={lp.navLogo} alt="logo" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <MapPin className="w-5 h-5 text-blue-600" />
            )}
            <span className="font-bold text-gray-800 text-sm sm:text-base">{lp.brandName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk
            </button>
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" /> Daftar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      {lp.showLanding && (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-teal-500 to-purple-600 text-white">
          {lp.heroImage && (
            <>
              <img src={lp.heroImage} alt="hero" className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-black/55" />
            </>
          )}
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center">
            <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              {lp.tagline}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5">
              {lp.heroTitle}
            </h1>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              {lp.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/auth?mode=register')}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-2xl transition-all shadow-lg"
              >
                Mulai Sekarang <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/auth?mode=login')}
                className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-2xl transition-all"
              >
                Sudah Punya Akun
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FITUR SECTION */}
      {lp.showLanding && lp.features.length > 0 && (
        <section className="bg-gray-50 py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Semua yang Kamu Butuhkan</h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Fitur lengkap untuk perjalanan yang sempurna</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {lp.features.map(f => (
                <div key={f.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-gray-800 mb-1.5">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT SECTION */}
      {lp.showLanding && (lp.aboutTitle || lp.aboutDesc) && (
        <section className="py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <div className={`flex flex-col ${lp.aboutImage ? 'md:flex-row' : ''} gap-8 items-center`}>
              {lp.aboutImage && (
                <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg">
                  <img src={lp.aboutImage} alt="about" className="w-full h-64 object-cover" />
                </div>
              )}
              <div className={lp.aboutImage ? 'w-full md:w-1/2' : 'max-w-2xl mx-auto text-center'}>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">{lp.aboutTitle}</h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{lp.aboutDesc}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      {lp.showLanding && lp.ctaText && (
        <section className="bg-gradient-to-r from-blue-600 via-teal-500 to-purple-600 py-14 px-4 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{lp.ctaText}</h2>
            <p className="text-blue-100 mb-7 text-sm sm:text-base">{lp.ctaSubText}</p>
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-2xl transition-all shadow-lg"
            >
              Daftar Gratis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-blue-600 via-teal-500 to-purple-600 text-white py-8 px-4 text-center mt-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          {lp.navLogo ? (
            <img src={lp.navLogo} alt="logo" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          <span className="font-bold">{lp.brandName}</span>
        </div>
        <p className="font-semibold">{data.settings?.footerText || '🗺️ Selamat Berlibur ke Yogyakarta!'}</p>
        <p className="text-blue-100 text-sm mt-1">{data.settings?.footerSub || 'Jangan lupa bawa kamera dan semangat petualangan ✨'}</p>
        <p className="text-white/40 text-xs mt-4">© {new Date().getFullYear()} Diaz Ahmad Septian. All rights reserved.</p>
      </footer>

    </div>
  );
}
