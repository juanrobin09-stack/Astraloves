import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  twinkle: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Utilise window si le parent est fixed/absolute, sinon parent size
        const isFixedParent = window.getComputedStyle(parent).position === 'fixed';
        canvas.width = isFixedParent ? window.innerWidth : parent.clientWidth;
        canvas.height = isFixedParent ? window.innerHeight : parent.clientHeight;
      }
      initStars();
    };

    const initStars = () => {
      starsRef.current = [];
      const count = 150;

      for (let i = 0; i < count; i++) {
        const sizeRandom = Math.random();
        let size: number;

        if (sizeRandom > 0.95) {
          size = Math.random() * 2 + 2.5;
        } else if (sizeRandom > 0.85) {
          size = Math.random() * 1 + 1.5;
        } else {
          size = Math.random() * 0.8 + 0.5;
        }

        const colorRandom = Math.random();
        let color: string;
        if (colorRandom > 0.85) {
          color = '#DC2626';
        } else if (colorRandom > 0.7) {
          color = '#EF4444';
        } else if (colorRandom > 0.55) {
          color = '#EC4899';
        } else {
          color = '#FFFFFF';
        }

        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          speed: Math.random() * 0.15 + 0.05,
          opacity: Math.random() * 0.4 + 0.6,
          color,
          twinkle: Math.random() * Math.PI * 2
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const milkyWayGradient = ctx.createLinearGradient(
        canvas.width * 0.3,
        0,
        canvas.width * 0.7,
        canvas.height
      );
      milkyWayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.01)');
      milkyWayGradient.addColorStop(0.3, 'rgba(220, 38, 38, 0.015)');
      milkyWayGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
      milkyWayGradient.addColorStop(0.7, 'rgba(239, 68, 68, 0.015)');
      milkyWayGradient.addColorStop(1, 'rgba(255, 255, 255, 0.01)');

      ctx.fillStyle = milkyWayGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const redGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.3);
      redGradient.addColorStop(0, 'rgba(139, 0, 0, 0.1)');
      redGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = redGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        const dx = mouseRef.current.x - star.x;
        const dy = mouseRef.current.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100 && distance > 0) {
          const force = (100 - distance) / 100;
          star.x -= (dx / distance) * force * 2.5;
          star.y -= (dy / distance) * force * 2.5;
        }

        star.y += star.speed;
        star.twinkle += star.size > 2 ? 0.03 : 0.02;

        if (star.y > canvas.height + 10) {
          star.y = -10;
          star.x = Math.random() * canvas.width;
        }
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;

        const twinkleEffect = (Math.sin(star.twinkle) + 1) / 2;
        const finalOpacity = star.opacity * (0.4 + twinkleEffect * 0.6);

        ctx.shadowBlur = star.size > 2 ? 8 : star.size > 1.5 ? 4 : 0;
        ctx.shadowColor = star.color;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        if (star.color === '#DC2626') {
          ctx.fillStyle = `rgba(220, 38, 38, ${finalOpacity})`;
        } else if (star.color === '#EF4444') {
          ctx.fillStyle = `rgba(239, 68, 68, ${finalOpacity})`;
        } else if (star.color === '#EC4899') {
          ctx.fillStyle = `rgba(236, 72, 153, ${finalOpacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        }
        ctx.fill();

        if (twinkleEffect > 0.75 && star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2);

          if (star.color === '#DC2626') {
            ctx.fillStyle = `rgba(220, 38, 38, ${finalOpacity * 0.12})`;
          } else if (star.color === '#EF4444') {
            ctx.fillStyle = `rgba(239, 68, 68, ${finalOpacity * 0.12})`;
          } else if (star.color === '#EC4899') {
            ctx.fillStyle = `rgba(236, 72, 153, ${finalOpacity * 0.12})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 0.12})`;
          }
          ctx.fill();
        }

        if (star.size > 2 && twinkleEffect > 0.85) {
          ctx.beginPath();
          const rayLength = star.size * 3;

          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + star.twinkle * 0.1;
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
              star.x + Math.cos(angle) * rayLength,
              star.y + Math.sin(angle) * rayLength
            );
          }

          let strokeColor: string;
          if (star.color === '#DC2626') {
            strokeColor = `rgba(220, 38, 38, ${finalOpacity * 0.4})`;
          } else if (star.color === '#EF4444') {
            strokeColor = `rgba(239, 68, 68, ${finalOpacity * 0.4})`;
          } else if (star.color === '#EC4899') {
            strokeColor = `rgba(236, 72, 153, ${finalOpacity * 0.4})`;
          } else {
            strokeColor = `rgba(255, 255, 255, ${finalOpacity * 0.4})`;
          }
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0, backgroundColor: '#0A0A0A' }}
    />
  );
}
