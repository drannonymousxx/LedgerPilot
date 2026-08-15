"use client";

import React, { useEffect, useRef } from "react";

interface DottedGlobeProps {
  className?: string;
  particleCount?: number;
}

export function DottedGlobe({
  className = "",
  particleCount = 4200,
}: DottedGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;

    // Media query for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Generate points uniformly over unit sphere using Fibonacci spiral algorithm
    const points: Array<{ x: number; y: number; z: number }> = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle (~2.3999 rad)

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // y ranges from 1 to -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({ x, y, z });
    }

    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const globeRadius = Math.min(width, height) * 0.42;
      const focalLength = 400;

      // Update rotation if motion is not reduced
      if (!prefersReducedMotion) {
        rotationAngle += 0.0035; // Slow, elegant rotation
      }

      const cosRot = Math.cos(rotationAngle);
      const sinRot = Math.sin(rotationAngle);

      // Render dots
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        // Rotate point around Y axis
        const rx = pt.x * cosRot - pt.z * sinRot;
        const ry = pt.y;
        const rz = pt.x * sinRot + pt.z * cosRot;

        // Perspective projection
        const scale = focalLength / (focalLength + rz * globeRadius * 0.5);
        const projectedX = centerX + rx * globeRadius;
        const projectedY = centerY + ry * globeRadius;

        // Front vs back surface atmospheric depth calculation
        // rz > 0 is front face (towards camera), rz < 0 is back face
        const isFront = rz > -0.15;
        const depthFactor = (rz + 1) / 2; // 0 (backmost) to 1 (frontmost)

        if (isFront) {
          // Dots on front hemisphere: crisp black (#111111) with opacity and size based on depth
          const alpha = 0.15 + depthFactor * 0.85; // 0.15 to 1.0
          const dotSize = Math.max(0.8, (0.8 + depthFactor * 1.8) * scale);

          ctx.fillStyle = `rgba(17, 17, 17, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(projectedX, projectedY, dotSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Subtle faint back hemisphere dots for 3D volume perception
          const alpha = Math.max(0.02, 0.08 * (1 + rz));
          const dotSize = 0.7 * scale;

          ctx.fillStyle = `rgba(17, 17, 17, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(projectedX, projectedY, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [particleCount]);

  return (
    <div className={`relative w-full aspect-square max-w-[560px] mx-auto flex items-center justify-center ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block relative z-10"
        aria-label="3D Dotted Rotating Globe representing global finance operations"
        role="img"
      />
      {/* Soft atmospheric radial shadow under globe */}
      <div className="absolute inset-4 rounded-full bg-radial from-black/[0.03] to-transparent pointer-events-none z-0" />
    </div>
  );
}
