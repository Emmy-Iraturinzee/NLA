import React from 'react';
import { motion } from 'motion/react';

interface NlaLoaderProps {
  message?: string;
}

export const NlaLoader: React.FC<NlaLoaderProps> = ({
  message = 'Signing in...',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="min-h-screen w-full bg-[#F4F7FA] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Soft Ambient NLA Color Glow */}
      <div
        className="absolute w-[420px] h-[420px] rounded-full pointer-events-none opacity-35 dark:opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(2, 152, 216, 0.28) 0%, rgba(250, 204, 21, 0.14) 50%, rgba(21, 128, 61, 0.14) 100%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
      >
        {/* Tri-Color NLA Orbital Spinner + Pin Emblem */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer Rotating Ring (Blue -> Gold -> Green) */}
          <svg
            viewBox="0 0 112 112"
            className="w-28 h-28 animate-spin"
            style={{ animationDuration: '1.35s' }}
            aria-hidden="true"
          >
            <circle
              cx="56"
              cy="56"
              r="49"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-200/80 dark:text-slate-800"
            />
            {/* NLA Sky Blue Arc */}
            <circle
              cx="56"
              cy="56"
              r="49"
              fill="none"
              stroke="#0298D8"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="118 308"
              strokeDashoffset="0"
            />
            {/* NLA Sun Gold Arc */}
            <circle
              cx="56"
              cy="56"
              r="49"
              fill="none"
              stroke="#FACC15"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="68 308"
              strokeDashoffset="-134"
            />
            {/* NLA Rolling Green Arc */}
            <circle
              cx="56"
              cy="56"
              r="49"
              fill="none"
              stroke="#15803D"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="68 308"
              strokeDashoffset="-218"
            />
          </svg>

          {/* Center White Medallion with NLA Pin Emblem */}
          <div className="absolute inset-[14px] rounded-full bg-white dark:bg-[#131C2E] shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <svg
              width="36"
              height="40"
              viewBox="0 0 40 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20 2C10.059 2 2 10.059 2 20C2 31.2 14.8 41.3 18.85 44.2C19.54 44.7 20.46 44.7 21.15 44.2C25.2 41.3 38 31.2 38 20C38 10.059 29.941 2 20 2Z"
                fill="#0298D8"
              />
              <circle cx="20" cy="19.5" r="14.5" fill="#E0F4FD" />
              <clipPath id="nla-loader-pin-inner">
                <circle cx="20" cy="19.5" r="14" />
              </clipPath>
              <g clipPath="url(#nla-loader-pin-inner)">
                <rect x="5" y="4" width="30" height="32" fill="#38BDF8" />
                <path
                  d="M4 17C9 14 14 16 20 15C26 14 31 17 36 16V36H4V17Z"
                  fill="#FACC15"
                />
                <path
                  d="M4 22C10 19 16 21 22 23C28 25 32 21 36 22V36H4V22Z"
                  fill="#15803D"
                />
                <path
                  d="M4 26C11 24 18 27 25 25C30 23.5 33 26 36 27V36H4V26Z"
                  fill="#166534"
                />
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
          </div>
        </div>

        {/* Minimal Status Label */}
        <p className="mt-5 text-[13.5px] font-semibold text-slate-600 dark:text-slate-300 tracking-tight">
          {message}
        </p>

        {/* NLA Tri-Color Progress Bar */}
        <div className="mt-6 w-56 h-1.5 rounded-full bg-slate-200/90 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full rounded-full"
            style={{
              background:
                'linear-gradient(90deg, #0298D8 0%, #38BDF8 45%, #FACC15 74%, #15803D 100%)',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};
