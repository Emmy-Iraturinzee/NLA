import React from 'react';

interface TopographicBackgroundProps {
  children: React.ReactNode;
  variant?: 'login' | 'search';
}

export const TopographicBackground: React.FC<TopographicBackgroundProps> = ({
  children,
  variant = 'login',
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Uploaded Lush Rwandan Hills & Topographic Background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden bg-[#1C2E1E]">
        <img
          src="/assets/aistudio/Login_lais_3dd28ae9.png"
          alt=""
          className={`w-full h-full object-cover ${
            variant === 'login' ? 'object-bottom' : 'object-center scale-[1.03]'
          }`}
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              variant === 'login'
                ? 'radial-gradient(circle at center, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.22) 100%)'
                : 'linear-gradient(180deg, rgba(15, 23, 42, 0.42) 0%, rgba(15, 23, 42, 0.28) 50%, rgba(15, 23, 42, 0.5) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </div>
  );
};
