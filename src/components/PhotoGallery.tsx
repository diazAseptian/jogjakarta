import React from 'react';
import { Camera } from 'lucide-react';

const PhotoGallery: React.FC = () => {
  const photos = [
    {
      url: "/img/ayang.jpeg",
      alt: "Beautiful smile",
      caption: "Senyummu yang paling aku rindukan 😊"
    },
    {
      url: "/img/wisuda.jpeg",
      alt: "Study time",
      caption: "Semangat belajarmu selalu menginspirasi aku! 📚"
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-purple-500 mr-3" />
          <h3 className="text-2xl font-bold text-gray-800">Foto Tersayangku</h3>
        </div>
        <p className="text-gray-600">Lihat betapa cantik dan hebatnya dirimu! ✨</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="group relative flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <img
              src={photo.url}
              alt={photo.alt}
              className="w-full max-h-96 object-contain bg-white transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-medium text-center">{photo.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-lg text-gray-700 font-medium">
          Kamu selalu cantik di mata aku! 💖
        </p>
      </div>
    </div>
  );
};

export default PhotoGallery;
