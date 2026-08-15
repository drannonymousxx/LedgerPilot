"use client";

import React, { useEffect, useRef, useState } from "react";

export function HalftoneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSupported, setCanvasSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCanvasSupported(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let time = 0;
    let introStartTime = performance.now();
    const introDuration = 1400; // 1.4s intro morphing animation

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Calculate intro morph progress (0 to 1 with cubic ease-out)
      const elapsed = now - introStartTime;
      const rawProgress = Math.min(Math.max(elapsed / introDuration, 0), 1);
      // Ease out cubic
      const introProgress = prefersReducedMotion ? 1 : 1 - Math.pow(1 - rawProgress, 3);

      ctx.clearRect(0, 0, width, height);

      // Warm ivory background
      ctx.fillStyle = "#F4F3ED";
      ctx.fillRect(0, 0, width, height);

      const spacing = 12; // Grid spacing
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      ctx.fillStyle = "#111111"; // 100% monochrome black dots

      const speed = prefersReducedMotion ? 0 : 0.006;
      time += speed;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          const nx = i / cols;
          const ny = j / rows;
          
          // Density distribution with intro morph transition:
          // During intro (progress 0 -> 1), dot field starts full and contracts smoothly into shape
          const rightBandTarget = Math.exp(-Math.pow((nx - 0.72) / 0.18, 2));
          const leftVortexTarget = Math.exp(-Math.pow((nx - 0.22) / 0.22, 2) - Math.pow((ny - 0.72) / 0.25, 2));
          
          // Initial full field blending into final pattern shape
          const initialField = 0.5 + Math.sin(nx * 3 + ny * 3) * 0.2;
          const rightBand = initialField * (1 - introProgress) + rightBandTarget * introProgress;
          const leftVortex = initialField * (1 - introProgress) + leftVortexTarget * introProgress;

          const dynamicWave = Math.sin(nx * 5 + time) * Math.cos(ny * 4 - time * 0.7) * 0.25;
          
          const rawDensity = Math.max(rightBand * 0.95, leftVortex * 0.95) + dynamicWave + 0.15;
          const density = Math.min(Math.max(rawDensity, 0.05), 1.0);

          const maxRadius = spacing * 0.54; // Touch adjacent dots at max density
          const minRadius = 0.75;
          const radius = minRadius + density * (maxRadius - minRadius);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!prefersReducedMotion || rawProgress < 1) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render(performance.now());

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!canvasSupported) {
    return (
      <div className="w-full h-full bg-[#F4F3ED] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: "radial-gradient(#111111 2.5px, transparent 2.5px)",
            backgroundSize: "12px 12px",
          }}
        />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block object-cover"
      style={{ minHeight: "100%", width: "100%" }}
    />
  );
}
