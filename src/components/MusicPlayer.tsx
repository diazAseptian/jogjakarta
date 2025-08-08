import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const songs = [
    {
      title: "My Dear",
      artist: "D.O",
      src: "/audio/uco.wav",
    },
    {
      title: "Same Dream, Same Mind, Same Night",
      artist: "Seventeen",
      src: "/audio/svt.wav",
    }
  ];

  // Fungsi play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Fungsi next song
  const nextSong = () => {
    const next = (currentSong + 1) % songs.length;
    setCurrentSong(next);
    setIsPlaying(true); // otomatis play lagu berikutnya
  };

  // Play lagu secara otomatis ketika currentSong berubah
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.play().catch((err) => console.error("Play error:", err));
    }
  }, [currentSong]);

  // Ketika lagu selesai, lanjut ke lagu berikutnya
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => nextSong();
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🎵 Musik Semangat</h3>
        <p className="text-sm text-gray-600">Dengarkan sambil belajar, sayang!</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
        <h4 className="font-semibold text-gray-800 mb-1">{songs[currentSong].title}</h4>
        <p className="text-sm text-gray-600">{songs[currentSong].artist}</p>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={togglePlayPause}
          className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white rounded-full p-4 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        
        <button
          onClick={nextSong}
          className="bg-white hover:bg-gray-50 text-gray-700 rounded-full p-3 transition-all duration-300 transform hover:scale-105 shadow-md border border-gray-200"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 text-center">
        <div className="flex space-x-2 justify-center">
          {songs.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSong(index);
                setIsPlaying(true);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSong === index
                  ? 'bg-purple-500 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      <audio ref={audioRef} src={songs[currentSong].src} preload="auto" />
    </div>
  );
};

export default MusicPlayer;
