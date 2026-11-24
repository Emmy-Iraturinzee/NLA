import React from 'react';

interface NlaLogoProps {
  compact?: boolean;
  lightText?: boolean;
}

export const NlaLogo: React.FC<NlaLogoProps> = ({ compact = false, lightText = false }) => {
  return (
    <div className="inline-flex items-center gap-2 select-none">
      {/* Rwanda NLA Location Pin Emblem */}
      <svg
        width={compact ? 32 : 36}
        height={compact ? 36 : 40}
        viewBox="0 0 40 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer Pin */}
        <path
          d="M20 2C10.059 2 2 10.059 2 20C2 31.2 14.8 41.3 18.85 44.2C19.54 44.7 20.46 44.7 21.15 44.2C25.2 41.3 38 31.2 38 20C38 10.059 29.941 2 20 2Z"
          fill="#0298D8"
        />
        {/* Inner Circle Clip */}
        <circle cx="20" cy="19.5" r="14.5" fill="#E0F4FD" />
        <clipPath id="nla-pin-inner">
          <circle cx="20" cy="19.5" r="14" />
        </clipPath>
        <g clipPath="url(#nla-pin-inner)">
          {/* Sky */}
          <rect x="5" y="4" width="30" height="32" fill="#38BDF8" />
          {/* Sunlit Horizon */}
          <path
            d="M4 17C9 14 14 16 20 15C26 14 31 17 36 16V36H4V17Z"
            fill="#FACC15"
          />
          {/* Rolling Green Hills */}
          <path
            d="M4 22C10 19 16 21 22 23C28 25 32 21 36 22V36H4V22Z"
            fill="#15803D"
          />
          <path
            d="M4 26C11 24 18 27 25 25C30 23.5 33 26 36 27V36H4V26Z"
            fill="#166534"
          />
          {/* Subtle River/Road curve */}
          <path
            d="M15 21C19 23 23 26 22 34"
            stroke="#BAE6FD"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
        <circle cx="20" cy="19.5" r="14.2" stroke="#FFFFFF" strokeWidth="1.4" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col items-start text-left leading-none">
        <span
          className={`text-[21px] font-extrabold tracking-tight ${
            lightText ? 'text-white' : 'text-[#0298D8]'
          }`}
        >
          NLA
        </span>
        <span
          className={`text-[8.5px] font-medium tracking-tight mt-0.5 ${
            lightText ? 'text-white/80' : 'text-[#64748B]'
          }`}
        >
          National Land Authority
        </span>
      </div>
    </div>
  );
};
