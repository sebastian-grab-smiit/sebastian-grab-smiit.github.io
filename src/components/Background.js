import React, { useEffect, useRef, useState } from "react";
import "../styles/Background.css";

/**
 * Background.js – continuous, non-repeating scroll motion
 * -------------------------------------------------------
 * Mount ONCE at the top of your app (e.g., in App.js) so it covers all pages.
 * The same “cloud” moves with you smoothly across sections (no tiling wrap).
 *
 * Props:
 *   quality     0.35..1.0  render scale (lower = faster)         default 0.6
 *   intensity   0.4..1.8   motion/contrast gain                   default 0.9
 *   speed       0.6..1.6   animation tempo                        default 1.0
 *   opacity     0.4..1.0   overall alpha                          default 0.65
 *   blur        8..32      final blur (px)                        default 20
 *   desaturate  0..0.6     reduce color saturation                default 0.25
 *   parallax    0..0.5     how much it follows scroll             default 0.24
 *   energyGain  0..1       how responsive to fast scrolls         default 0.8
 */

export default function Background({
  quality = 0.6,
  intensity = 0.9,
  speed = 1.0,
  opacity = 0.65,
  blur = 20,
  desaturate = 0.25,
  parallax = 0.24,
  energyGain = 0.8,
}) {
  const canvasRef = useRef(null);
  const offRef = useRef(null);
  const rafRef = useRef(0);
  const reduceMotion = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const pointer = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0 });

  useEffect(() => {
    setMounted(true);
    const handleMove = (e) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const nx = clamp(e.clientX / vw, 0, 1);
      const ny = clamp(e.clientY / vh, 0, 1);
      pointer.current.vx = nx - pointer.current.x;
      pointer.current.vy = ny - pointer.current.y;
      pointer.current.x = nx;
      pointer.current.y = ny;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let scale = clamp(quality, 0.35, 1);
    const off = (offRef.current = document.createElement("canvas"));
    const octx = off.getContext("2d");

    let w = 0, h = 0;
    const resize = () => {
      w = Math.floor(window.innerWidth * DPR * scale);
      h = Math.floor(window.innerHeight * DPR * scale);
      off.width = Math.max(2, w);
      off.height = Math.max(2, h);
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      // CSS sizes are handled by .bg-canvas styles
    };
    resize();
    window.addEventListener("resize", resize);

    const simplex = createSimplexNoise();

    // Brand palette (HSL)
    const a1 = hexToHsl("#0198fd"); // accent-1 (blue)
    const a2 = hexToHsl("#ec00ef"); // accent-2 (magenta)
    const mix = hexToHsl("#764cf6"); // blend
    const palette = [a1, mix, a2];

    // Blobs
    const BLOBS = 6;
    const blobs = Array.from({ length: BLOBS }, (_, i) => ({
      phase: Math.random() * 1000,
      radius: 0.22 + Math.random() * 0.18,
    }));

    // Scroll state
    let scrollY = window.scrollY || 0;
    let energy = 0; // kinetic energy from scroll velocity
    const onScroll = () => {
      const y = window.scrollY || 0;
      const dy = y - scrollY;
      scrollY = y;
      const vel = Math.abs(dy) / Math.max(1, window.innerHeight); // ~0..1
      energy = energy * 0.9 + Math.min(1, vel * (0.5 + 0.5 * energyGain)) * 0.6;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const draw = (t) => {
      // render field to offscreen, then composite once to main canvas
      octx.globalCompositeOperation = "source-over";
      octx.fillStyle = "rgba(0,0,0,0.06)";
      octx.fillRect(0, 0, off.width, off.height);

      // animation time (decoupled from scroll)
      const time = reduceMotion ? 0 : t * 0.00022 * speed;
      const px = pointer.current.x;
      const py = pointer.current.y;

      // world-space translation of the field in offscreen units
      const vh = Math.max(1, window.innerHeight);
      const worldYOff = scrollY * parallax * (off.height / vh);

      for (let i = 0; i < BLOBS; i++) {
        const b = blobs[i];
        const nx = simplex.noise3D(i * 1.2, time + b.phase, px * 2 - 1);
        const ny = simplex.noise3D(time + b.phase, i * 1.5, py * 2 - 1);
        const ang = Math.atan2(ny, nx);
        const baseX = (0.5 + 0.3 * Math.cos(ang) + 0.08 * (px - 0.5)) * off.width;
        const baseY = (0.5 + 0.3 * Math.sin(ang) + 0.08 * (py - 0.5)) * off.height;

        const r =
          (Math.min(off.width, off.height) *
            b.radius *
            (0.85 + 0.35 * Math.sin(time * 1.2 + i)) *
            (1.0 + energy * 0.25)) / 1.0;

        const c = lerpHsl(
          palette[i % palette.length],
          palette[(i + 1) % palette.length],
          (Math.sin(time * 0.65 + i) + 1) / 2
        );

        const alpha = (0.10 + 0.05 * energy) * intensity;
        // draw clones at y + world shift to cover viewport edges
        const centersY = [baseY - worldYOff - off.height, baseY - worldYOff, baseY - worldYOff + off.height];
        for (const cy of centersY) {
          const g = octx.createRadialGradient(baseX, cy, r * 0.2, baseX, cy, r);
          g.addColorStop(0, `hsla(${c.h.toFixed(1)}, ${(c.s * (1 - desaturate)).toFixed(1)}%, ${(c.l).toFixed(1)}%, ${alpha})`);
          g.addColorStop(1, `hsla(${c.h.toFixed(1)}, ${(c.s * (1 - desaturate)).toFixed(1)}%, ${(c.l).toFixed(1)}%, 0)`);
          octx.globalCompositeOperation = "lighter";
          octx.fillStyle = g;
          octx.beginPath();
          octx.arc(baseX, cy, r, 0, Math.PI * 2);
          octx.fill();
        }
      }

      // Composite to main canvas (no wrapping)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sat = Math.max(0, 1 - desaturate);
      ctx.filter = `blur(${Math.floor(blur)}px) saturate(${Math.round(sat * 100)}%)`;
      ctx.globalAlpha = clamp(opacity, 0.4, 1);
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);

      if (!reduceMotion) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    if (reduceMotion) draw(0);
    else rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, quality, intensity, speed, opacity, blur, desaturate, parallax, energyGain, reduceMotion]);

  return (
    <div className="bg-root" aria-hidden>
      <canvas ref={canvasRef} className="bg-canvas" />
      <div className="bg-grain" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────────────── */

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefers(!!mq.matches);
    onChange();
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
    };
  }, []);
  return prefers;
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function hexToHsl(hex) {
  let r = 0, g = 0, b = 0;
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpHsl(c1, c2, t) {
  let h1 = c1.h, h2 = c2.h;
  let dh = ((h2 - h1 + 540) % 360) - 180;
  return { h: h1 + dh * t, s: lerp(c1.s, c2.s, t), l: lerp(c1.l, c2.l, t) };
}

// Simplex noise (3D) adapted from Stefan Gustavson
function createSimplexNoise() {
  const F3 = 1.0 / 3.0;
  const G3 = 1.0 / 6.0;

  const grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];

  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let seed = 1337;
  const rand = () => (seed ^= seed << 13, seed ^= seed >> 17, seed ^= seed << 5, (seed < 0 ? ~seed + 1 : seed) % 256);
  for (let i = 255; i > 0; i--) {
    const n = rand() % (i + 1);
    const tmp = p[i]; p[i] = p[n]; p[n] = tmp;
  }

  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = perm[i] % 12;
  }

  function noise3D(xin, yin, zin) {
    const s = (xin + yin + zin) * F3;
    let i = Math.floor(xin + s);
    let j = Math.floor(yin + s);
    let k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1, j1, k1;
    let i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    i &= 255; j &= 255; k &= 255;
    const gi0 = permMod12[i + perm[j + perm[k]]];
    const gi1 = permMod12[i + 1 + perm[j + perm[k]]];
    const gi2 = permMod12[i + 1 + perm[j + 1 + perm[k]]];
    const gi3 = permMod12[i + 1 + perm[j + 1 + perm[k + 1]]];

    let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * dot(grad3[gi0], x0, y0, z0);
    }
    let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * dot(grad3[gi1], x1, y1, z1);
    }
    let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * dot(grad3[gi2], x2, y2, z2);
    }
    let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    let n3 = 0;
    if (t3 >= 0) {
      t3 *= t3;
      n3 = t3 * t3 * dot(grad3[gi3], x3, y3, z3);
    }
    return 32.0 * (n0 + n1 + n2 + n3);
  }

  function dot(g, x, y, z) { return g[0] * x + g[1] * y + g[2] * z; }

  return { noise3D };
}
