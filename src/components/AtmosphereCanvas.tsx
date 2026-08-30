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
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Pre-render a smoke sprite onto an offscreen canvas to avoid creating gradients on every frame!
    const smokeCanvas = document.createElement('canvas');
    const smokeSize = 64;
    smokeCanvas.width = smokeSize;
    smokeCanvas.height = smokeSize;
    const sCtx = smokeCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(smokeSize / 2, smokeSize / 2, 0, smokeSize / 2, smokeSize / 2, smokeSize / 2);
      grad.addColorStop(0, 'rgba(215, 210, 200, 0.25)');
      grad.addColorStop(0.5, 'rgba(180, 175, 165, 0.1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, smokeSize, smokeSize);
    }

    let resizeTimeout: number | undefined;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Dynamic particle count based on screen width
    const isMobile = width < 768;
    const baseCount = isMobile ? (intensity === 'full' ? 40 : 20) : (intensity === 'full' ? 75 : 35);
    const particles: Particle[] = [];

    // Initialize rain, dust, and smoke
    for (let i = 0; i < baseCount; i++) {
      const type = Math.random() < 0.65 ? 'rain' : Math.random() < 0.85 ? 'dust' : 'smoke';
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: type === 'rain' ? 10 + Math.random() * 6 : type === 'smoke' ? -0.35 - Math.random() * 0.35 : 0.15 + Math.random() * 0.3,
        speedX: type === 'rain' ? -1.2 - Math.random() * 1.0 : (Math.random() - 0.5) * 0.3,
        length: type === 'rain' ? 14 + Math.random() * 18 : 1,
        opacity: type === 'rain' ? 0.12 + Math.random() * 0.14 : type === 'smoke' ? 0.15 + Math.random() * 0.15 : 0.2 + Math.random() * 0.25,
        size: type === 'smoke' ? 24 + Math.random() * 28 : type === 'dust' ? 1 + Math.random() * 1.5 : 1,
        type,
      });
    }

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 16.67, 2.0); // Clamp delta to avoid big jumps
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX * delta;
        p.y += p.speedY * delta;

        if (p.type === 'rain') {
          if (p.y > height) {
            p.y = -p.length;
            p.x = Math.random() * (width + 150);
          }
          if (p.x < -30) p.x = width + 30;

          // Draw rain streak
          ctx.strokeStyle = `rgba(205, 215, 225, ${p.opacity})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.stroke();
        } else if (p.type === 'smoke') {
          if (p.y < -p.size) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }
          
          // Draw fast pre-rendered smoke sprite
          ctx.globalAlpha = p.opacity;
          ctx.drawImage(smokeCanvas, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          ctx.globalAlpha = 1.0;
        } else {
          // Dust mote in dim ambient light
          if (p.y > height) p.y = 0;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.fillStyle = `rgba(229, 203, 145, ${p.opacity})`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 opacity-60 mix-blend-screen will-change-transform"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
