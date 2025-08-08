import React from 'react';
import { X, Heart } from 'lucide-react';

interface LoveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoveLetterModal: React.FC<LoveLetterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300 relative">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Konten Modal */}
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Surat Cinta Untukmu
            </h2>
            <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mx-auto" />
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
            <p className="text-center font-medium text-pink-600">
              Untuk cintaku yang paling berharga... 💕
            </p>

            <p>
              Sayang, aku tahu ujian ini mungkin terasa berat dan menegangkan.
              Tapi aku ingin kamu tahu bahwa aku sangat bangga dengan semua usaha
              dan kerja keras yang sudah kamu lakukan.
            </p>

            <p>
              Kamu adalah orang yang kuat, cerdas, dan luar biasa. Tidak ada yang
              mustahil bagimu. Aku percaya 100% bahwa kamu akan berhasil melewati
              ujian ini dengan gemilang! ✨
            </p>

            <p>
              Ingat, aku selalu ada untukmu. Dalam setiap langkah, dalam setiap
              nafas, aku mendukungmu. Kamu tidak sendirian dalam perjuangan ini.
            </p>

            <p className="text-center font-semibold text-pink-600 mt-6">
              Aku mencintaimu dan percaya padamu! 🌟
            </p>

            <p className="text-center text-xs sm:text-sm text-gray-500 italic">
              Dengan cinta yang tak terbatas,<br />
              Pacarmu yang paling sayang ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoveLetterModal;
