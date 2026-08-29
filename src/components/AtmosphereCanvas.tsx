import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  length: number;
  opacity: number;
  size: number;
  type: 'rain' | 'smoke' | 'dust';
}

export const AtmosphereCanvas: React.FC<{ intensity?: 'subtle' | 'full' }> = ({ intensity = 'full' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = intensity === 'full' ? 90 : 45;
    const particles: Particle[] = [];

    // Initialize rain, dust, and smoke
    for (let i = 0; i < particleCount; i++) {
      const type = Math.random() < 0.65 ? 'rain' : Math.random() < 0.85 ? 'dust' : 'smoke';
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: type === 'rain' ? 12 + Math.random() * 8 : type === 'smoke' ? -0.4 - Math.random() * 0.5 : 0.2 + Math.random() * 0.4,
        speedX: type === 'rain' ? -1.5 - Math.random() * 1.5 : (Math.random() - 0.5) * 0.4,
        length: type === 'rain' ? 18 + Math.random() * 22 : 1,
        opacity: type === 'rain' ? 0.12 + Math.random() * 0.18 : type === 'smoke' ? 0.04 + Math.random() * 0.06 : 0.2 + Math.random() * 0.3,
        size: type === 'smoke' ? 14 + Math.random() * 24 : type === 'dust' ? 1 + Math.random() * 1.8 : 1,
        type,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.type === 'rain') {
          if (p.y > height) {
            p.y = -p.length;
            p.x = Math.random() * (width + 200);
          }
          if (p.x < -50) p.x = width + 50;

          // Draw rain streak
          ctx.beginPath();
          ctx.strokeStyle = `rgba(210, 220, 230, ${p.opacity})`;
          ctx.lineWidth = 1.1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.stroke();
        } else if (p.type === 'smoke') {
          if (p.y < -50) {
            p.y = height + 30;
            p.x = Math.random() * width;
          }
          // Draw subtle wisp of cigarette smoke
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(200, 195, 185, ${p.opacity})`);
          grad.addColorStop(0.6, `rgba(180, 175, 165, ${p.opacity * 0.4})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Dust mote in dim light
          if (p.y > height) p.y = 0;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.fillStyle = `rgba(229, 203, 145, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 opacity-70 mix-blend-screen"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
