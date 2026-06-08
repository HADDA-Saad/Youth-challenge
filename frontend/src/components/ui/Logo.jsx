import React from 'react';

export default function Logo({ size = 36, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full transform hover:scale-105 transition-transform duration-300 ease-out"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main neon gradient */}
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" /> {/* Violet 600 */}
            <stop offset="50%" stopColor="#3b82f6" /> {/* Blue 500 */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan 500 */}
          </linearGradient>

          {/* Secondary glow gradient */}
          <linearGradient id="logoGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Glass background fill */}
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.07)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.01)" />
          </linearGradient>
        </defs>

        {/* Subtle background glow effect (behind logo) */}
        <circle cx="50" cy="50" r="38" fill="url(#logoGlow)" opacity="0.15" filter="blur(6px)" />

        {/* Outer shield boundary (glass style with gradient stroke) */}
        <path
          d="M50 10 L82 26 V58 L50 88 L18 58 V26 Z"
          fill="url(#glassGrad)"
          stroke="url(#logoGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(124,58,237,0.3)]"
        />

        {/* The 'Y' element: Outer crown facets & center stem */}
        <path
          d="M32 30 L50 48 L68 30 M50 48 V76"
          stroke="url(#logoGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The 'C' element: Wrapping crescent/shield border */}
        <path
          d="M62 20 H36 L24 32 V54 L36 66 H62"
          stroke="url(#logoGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        
        {/* Core crown jewel / target dot */}
        <circle cx="50" cy="30" r="4.5" fill="#06b6d4" className="animate-pulse" />
      </svg>
    </div>
  );
}
