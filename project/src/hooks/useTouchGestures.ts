import { useEffect, useRef, useCallback } from 'react';

interface TouchGesturesOptions {
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
  minScale?: number;
  maxScale?: number;
}

interface Touch {
  x: number;
  y: number;
  id: number;
}

export function useTouchGestures(options: TouchGesturesOptions) {
  const {
    onPinch,
    onPan,
    onDoubleTap,
    onLongPress,
    minScale = 0.5,
    maxScale = 3,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const touchesRef = useRef<Touch[]>([]);
  const lastDistanceRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPinchingRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getCenter = useCallback((touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2,
    };
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches).map((touch) => ({
      x: touch.clientX,
      y: touch.clientY,
      id: touch.identifier,
    }));

    touchesRef.current = touches;

    if (touches.length === 2) {
      isPinchingRef.current = true;
      const distance = getDistance(touches[0], touches[1]);
      lastDistanceRef.current = distance;
    }

    if (touches.length === 1) {
      lastPanRef.current = { x: touches[0].x, y: touches[0].y };

      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      if (timeSinceLastTap < 300) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        onDoubleTap?.(touches[0].x, touches[0].y);
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;

        if (onLongPress) {
          longPressTimerRef.current = setTimeout(() => {
            onLongPress(touches[0].x, touches[0].y);
            longPressTimerRef.current = null;
          }, 500);
        }
      }
    }
  }, [getDistance, onDoubleTap, onLongPress]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();

    const touches = Array.from(e.touches).map((touch) => ({
      x: touch.clientX,
      y: touch.clientY,
      id: touch.identifier,
    }));

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (touches.length === 2 && isPinchingRef.current) {
      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);

      if (lastDistanceRef.current > 0) {
        let scale = distance / lastDistanceRef.current;
        scale = Math.max(minScale, Math.min(maxScale, scale));
        onPinch?.(scale, center);
      }

      lastDistanceRef.current = distance;
    } else if (touches.length === 1 && !isPinchingRef.current) {
      const deltaX = touches[0].x - lastPanRef.current.x;
      const deltaY = touches[0].y - lastPanRef.current.y;

      onPan?.(deltaX, deltaY);

      lastPanRef.current = { x: touches[0].x, y: touches[0].y };
    }

    touchesRef.current = touches;
  }, [getDistance, getCenter, onPinch, onPan, minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    isPinchingRef.current = false;
    lastDistanceRef.current = 0;
    touchesRef.current = [];
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
}
