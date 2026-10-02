import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StudyVerseLogo: React.FC<Props> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Customized StudyVerse Crest in Sage Green & Champagne */}
      <div className={`relative ${current.icon} rounded-2xl bg-gradient-to-br from-[#697d62] via-[#7d9376] to-[#50614b] p-0.5 shadow-md shadow-[#697d62]/20 flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Misty Blue Orbital Halo */}
          <ellipse
            cx="20"
            cy="20"
            rx="16"
            ry="7"
            transform="rotate(-25 20 20)"
            stroke="#d6e6f0"
            strokeWidth="1.25"
            strokeDasharray="3 2"
            opacity="0.9"
          />

          {/* Book Left Page - Champagne / Cashmere */}
          <path
            d="M8 26C12 24.5 17 24.5 20 26.5V13C17 11 12 11 8 12.5V26Z"
            fill="#faf6ee"
            stroke="#dcd3c4"
            strokeWidth="1"
          />

          {/* Book Right Page - Buttercream / Warm White */}
          <path
            d="M32 26C28 24.5 23 24.5 20 26.5V13C23 11 28 11 32 12.5V26Z"
            fill="#f7f2e7"
            stroke="#dcd3c4"
            strokeWidth="1"
          />

          {/* Book Spine Center - Sage Green */}
          <line x1="20" y1="13" x2="20" y2="27" stroke="#8fa488" strokeWidth="1.5" />

          {/* Central North Star - Champagne Gold with Misty Blue center */}
          <path
            d="M20 6L21.2 9.8L25 11L21.2 12.2L20 16L18.8 12.2L15 11L18.8 9.8L20 6Z"
            fill="#e2cf9f"
            stroke="#c4ab71"
            strokeWidth="0.5"
          />

          {/* Sparkle Nodes */}
          <circle cx="28" cy="8" r="1.2" fill="#d9adad" /> {/* Dusty Rose */}
          <circle cx="11" cy="29" r="1" fill="#8faec2" /> {/* Misty Blue */}
        </svg>
      </div>

      {/* Brand Typography in Sandstone Charcoal & Sage Green */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-extrabold tracking-tight text-[#2d2720] font-sans ${current.text}`}>
            Study<span className="text-[#697d62]">Verse</span>
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#8faec2]"></span>
        </div>
        <span className={`text-[#736a5c] font-medium tracking-wide mt-0.5 ${current.sub}`}>
          Official WhatsApp Community
        </span>
      </div>
    </div>
  );
};
