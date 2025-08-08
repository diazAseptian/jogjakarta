import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

const ConfettiEffect: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const colors = ['#ff69b4', '#ff91a4', '#ffc0cb', '#87ceeb', '#98fb98', '#dda0dd'];

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      const pieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 5,
        });
      }
      
      setConfetti(pieces);
      
      const animation = () => {
        setConfetti(prev => 
          prev.map(piece => ({
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            rotation: piece.rotation + piece.rotationSpeed,
          })).filter(piece => piece.y < window.innerHeight + 10)
        );
      };

      const interval = setInterval(animation, 16);
      
      setTimeout(() => {
        setIsVisible(false);
        clearInterval(interval);
        setConfetti([]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [trigger]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;