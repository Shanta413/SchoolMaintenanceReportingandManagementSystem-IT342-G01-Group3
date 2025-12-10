import React from 'react';
import '../css/components_css/CitfixLogo.css';

function CitfixLogo({ className = '', size = 'md', variant = 'full' }) {
  const sizes = {
    sm: { width: 120, height: 40 },
    md: { width: 160, height: 54 },
    lg: { width: 200, height: 68 },
  };

  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  if (variant === 'icon') {
    const iconSize = iconSizes[size];
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M24 4L6 12V22C6 32 12 40 24 44C36 40 42 32 42 22V12L24 4Z"
          fill="url(#shield-gradient)"
        />
        <path
          d="M18 20L16 22L22 28L24 26L18 20Z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="19" r="2.5" fill="white" />
        <path
          d="M20 26L24 30L32 20"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="shield-gradient" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  const { width, height } = sizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield icon - stays blue */}
      <g transform="translate(0, 10)">
        <path
          d="M24 4L6 12V22C6 32 12 40 24 44C36 40 42 32 42 22V12L24 4Z"
          fill="url(#logo-gradient)"
        />
        <path
          d="M18 20L16 22L22 28L24 26L18 20Z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="19" r="2.5" fill="white" />
        <path
          d="M20 26L24 30L32 20"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* CITFIX text - add class for dark mode */}
      <g transform="translate(54, 10)" className="citfix-text">
        <path
          d="M8 38.5C3.58172 38.5 0 34.9183 0 30.5V17.5C0 13.0817 3.58172 9.5 8 9.5H12V15.5H8C6.89543 15.5 6 16.3954 6 17.5V30.5C6 31.6046 6.89543 32.5 8 32.5H12V38.5H8Z"
          fill="#1E40AF"
        />
        <rect x="22" y="9.5" width="6" height="29" fill="#1E40AF" />
        <path
          d="M38 9.5H58V15.5H51V38.5H45V15.5H38V9.5Z"
          fill="#1E40AF"
        />
        <path
          d="M68 9.5H88V15.5H74V21.5H85V27.5H74V38.5H68V9.5Z"
          fill="#1E40AF"
        />
        <rect x="98" y="9.5" width="6" height="29" fill="#1E40AF" />
        <path
          d="M114 9.5L121 24L128 9.5H135L125.5 28L135.5 38.5H128L121 26.5L114 38.5H107L117 28L107.5 9.5H114Z"
          fill="#2563EB"
        />
      </g>

      <defs>
        <linearGradient id="logo-gradient" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default CitfixLogo;