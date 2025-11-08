"use client";

import React, { useRef, useEffect, useCallback } from 'react';

// Types
type Point = {
  x: number;
  y: number;
};

type DynamicPoint = {
  pos: Point;
  vel: Point;
};

// Math Helpers
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const getCubicBezierPoint = (t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  return { x, y };
};

const getCubicBezierTangent = (t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;

  const x = 3 * uu * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * tt * (p3.x - p2.x);
  const y = 3 * uu * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * tt * (p3.y - p2.y);

  const length = Math.sqrt(x * x + y * y);
  return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
};


export const KineticCurve = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  // Use refs for mutable state that doesn't trigger re-renders in the animation loop
  const p0 = useRef<Point>({ x: 0, y: 0 });
  const p3 = useRef<Point>({ x: 0, y: 0 });
  const p1 = useRef<DynamicPoint>({ pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 } });
  const p2 = useRef<DynamicPoint>({ pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 } });
  const mousePos = useRef<Point>({ x: 0, y: 0 });
  
  // Physics and appearance constants
  const springK = 0.05;
  const damping = 0.8;
  const tangentLength = 40;
  const colors = {
    primary: '#29ABE2',
    accent: '#F26419',
    foreground: '#333333',
    helper: 'rgba(41, 171, 226, 0.3)',
  };

  const init = useCallback((canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;
    const padding = width * 0.1;
    
    p0.current = { x: padding, y: height / 2 };
    p3.current = { x: width - padding, y: height / 2 };

    p1.current.pos = { x: lerp(p0.current.x, p3.current.x, 0.25), y: height / 2 - 100 };
    p2.current.pos = { x: lerp(p0.current.x, p3.current.x, 0.75), y: height / 2 + 100 };
    
    mousePos.current = { x: width / 2, y: height / 2 };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const cp0 = p0.current;
    const cp1 = p1.current.pos;
    const cp2 = p2.current.pos;
    const cp3 = p3.current;

    // Draw control polygon (helper lines)
    ctx.strokeStyle = colors.helper;
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cp0.x, cp0.y);
    ctx.lineTo(cp1.x, cp1.y);
    ctx.lineTo(cp2.x, cp2.y);
    ctx.lineTo(cp3.x, cp3.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Bézier curve
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cp0.x, cp0.y);
    for (let t = 0.01; t <= 1.001; t += 0.01) {
      const point = getCubicBezierPoint(t, cp0, cp1, cp2, cp3);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    // Draw tangents
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    for (let t = 0.1; t < 1; t += 0.2) {
      const point = getCubicBezierPoint(t, cp0, cp1, cp2, cp3);
      const tangent = getCubicBezierTangent(t, cp0, cp1, cp2, cp3);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x + tangent.x * tangentLength, point.y + tangent.y * tangentLength);
      ctx.stroke();
    }
    
    // Draw control points
    const drawPoint = (point: Point, color: string, radius: number) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };
    
    drawPoint(cp0, colors.foreground, 8);
    drawPoint(cp3, colors.foreground, 8);
    drawPoint(cp1, colors.accent, 10);
    drawPoint(cp2, colors.accent, 10);

  }, [colors, tangentLength]);

  const updatePhysics = useCallback(() => {
    const updatePoint = (point: DynamicPoint, target: Point) => {
      const dx = target.x - point.pos.x;
      const dy = target.y - point.pos.y;
      
      const accelX = dx * springK;
      const accelY = dy * springK;
      
      point.vel.x += accelX;
      point.vel.y += accelY;
      
      point.vel.x *= damping;
      point.vel.y *= damping;
      
      point.pos.x += point.vel.x;
      point.pos.y += point.vel.y;
    };
    
    updatePoint(p1.current, mousePos.current);

    const canvas = canvasRef.current;
    if (canvas) {
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const mirroredMouse = {
            x: center.x + (center.x - mousePos.current.x),
            y: center.y + (center.y - mousePos.current.y),
        };
        updatePoint(p2.current, mirroredMouse);
    } else {
        updatePoint(p2.current, mousePos.current);
    }

  }, [damping, springK]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const setCanvasDimensions = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        return { width: rect.width, height: rect.height };
    };

    const { width, height } = setCanvasDimensions();
    init({ ...canvas, width, height });
    
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current.x = event.clientX - rect.left;
      mousePos.current.y = event.clientY - rect.top;
    };
    
    const handleResize = () => {
        const { width, height } = setCanvasDimensions();
        init({ ...canvas, width, height });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      updatePhysics();
      const { width, height } = canvas.getBoundingClientRect();
      draw(ctx, { ...canvas, width, height });
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [draw, init, updatePhysics]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
