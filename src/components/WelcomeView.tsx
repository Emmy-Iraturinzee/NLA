import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Layers,
  Lock,
  MapPin,
  Network,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { NlaLogo } from './NlaLogo';

interface WelcomeViewProps {
  onGoToLogin: () => void;
}

const RWANDA_OUTLINE_PATH =
  'M34 15 L45 11 L54 14 L67 7 L78 12 L84 26 L80 42 L87 56 L81 69 L65 71 L53 76 L39 76 L27 84 L16 79 L12 66 L19 52 L17 36 L24 22 Z';

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onGoToLogin }) => {
  const [bgImgFailed, setBgImgFailed] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#F7FBFF] via-[#EDF6FD] to-[#DFF0FC] text-[#0C1B33] font-display flex flex-col justify-between">
      {/* Full-Bleed Background Image */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {!bgImgFailed && (
          <img
            src="/assets/aistudio/Serene_Kigali_Techscape_with_Abstract_Waves_1d0e8e54.png"
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            onError={() => setBgImgFailed(true)}
            className="w-full h-full object-cover object-right lg:object-center"
            draggable={false}
          />
        )}

        {/* Measured Legibility Scrim for Mobile/Tablet & Bottom Footer */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#F5FAFF]/90 via-[#F5FAFF]/55 to-transparent lg:from-[#F5FAFF]/20 lg:via-transparent lg:to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/75 via-white/25 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 pt-6 pb-2 flex items-center justify-between gap-8">
        <NlaLogo />

        <button
          type="button"
          onClick={onGoToLogin}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0298D8] to-[#0074C7] hover:from-[#0289C5] hover:to-[#0066B2] text-white text-[13.5px] font-semibold shadow-[0_8px_22px_rgba(2,152,216,0.28)] hover:shadow-[0_10px_26px_rgba(2,152,216,0.38)] active:scale-[0.99] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0298D8] focus-visible:ring-offset-2"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Hero Canvas */}
      <main className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Editorial Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col items-start"
            >
              {/* Kicker */}
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-[3px] h-4 rounded-full bg-[#EAB308]" aria-hidden="true" />
                <p className="text-[13.5px] font-medium text-[#1E3A5F] tracking-tight">
                  Republic of Rwanda · National Land Authority
                </p>
              </div>

              {/* Stacked Display Headline */}
              <h1
                className="font-extrabold tracking-[-0.03em] leading-[1.03] text-[#0C1B33]"
                style={{ fontSize: 'clamp(2.5rem, 4.4vw, 3.85rem)' }}
              >
                <span className="block">Land</span>
                <span className="block">Administration</span>
                <span className="block">Information</span>
                <span className="block text-[#0298D8]">System</span>
              </h1>

              {/* Single-Sentence Subtitle */}
              <p className="mt-5 text-[15.5px] sm:text-[16.5px] leading-[1.55] text-[#2D4363] max-w-[38ch] font-normal">
                Unified parcel registry, cadastral mapping, and digital title workflows across
                Rwanda.
              </p>

              {/* Primary CTA */}
              <div className="mt-7">
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0298D8] to-[#0070C4] hover:from-[#0289C5] hover:to-[#0062AD] text-white text-[14.5px] font-semibold shadow-[0_12px_28px_rgba(2,152,216,0.34)] hover:shadow-[0_14px_32px_rgba(2,152,216,0.44)] active:scale-[0.99] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0298D8] focus-visible:ring-offset-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Frosted Glass 3-Metric Bar */}
              <div className="mt-9 w-full max-w-[490px] rounded-2xl bg-white/80 backdrop-blur-md border border-white/95 shadow-[0_12px_36px_rgba(15,43,76,0.08)] px-5 py-4 grid grid-cols-3 divide-x divide-slate-200/80">
                <div className="flex items-center gap-3 pr-3">
                  <div className="w-9 h-9 rounded-full bg-[#E6F4FC] text-[#0298D8] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono-code tabular-nums text-[17px] sm:text-[19px] font-bold text-[#0C1B33] leading-none">
                      11.5M+
                    </div>
                    <div className="text-[11.5px] font-medium text-slate-500 mt-1">
                      Parcels
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-3 sm:px-4">
                  <div className="w-9 h-9 rounded-full bg-[#E6F4FC] text-[#0298D8] flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono-code tabular-nums text-[17px] sm:text-[19px] font-bold text-[#0C1B33] leading-none">
                      30
                    </div>
                    <div className="text-[11.5px] font-medium text-slate-500 mt-1">
                      Districts
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-3 sm:pl-4">
                  <div className="w-9 h-9 rounded-full bg-[#E6F4FC] text-[#0298D8] flex items-center justify-center shrink-0">
                    <Network className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono-code tabular-nums text-[17px] sm:text-[19px] font-bold text-[#0C1B33] leading-none">
                      7
                    </div>
                    <div className="text-[11.5px] font-medium text-slate-500 mt-1">
                      Integrations
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Spatial Overlay Anchored Over Background Kigali Scene */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex lg:col-span-6 relative h-[460px] pointer-events-none select-none"
            >
              {/* Kigali Hillside Pin Anchor */}
              <div className="absolute left-[26%] top-[33%] flex items-center justify-center">
                <span className="w-7 h-7 rounded-full bg-[#38BDF8]/30 flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0298D8] shadow-md" />
                </span>
              </div>

              {/* Floating Frosted Glass "Kigali, Rwanda · EPSG:4326" Card */}
              <div className="absolute top-[11%] right-[4%] rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 shadow-[0_14px_34px_rgba(12,27,51,0.14)] px-4 py-3 flex items-center gap-3">
                <div className="w-11 h-9 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 90" className="w-full h-full" aria-hidden="true">
                    <path
                      d={RWANDA_OUTLINE_PATH}
                      fill="#1D9CE0"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="leading-tight">
                  <div className="text-[14px] font-bold text-[#0C1B33] whitespace-nowrap">
                    Kigali, Rwanda
                  </div>
                  <div className="flex items-center gap-1 text-[11.5px] font-mono-code font-medium text-[#2E5077] mt-0.5 whitespace-nowrap">
                    <MapPin className="w-3 h-3 text-[#0298D8] shrink-0" />
                    <span>EPSG:4326</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 pb-6 pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#355070]">
        <div className="flex items-center gap-2.5 font-medium shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#0298D8] shrink-0" />
          <span>Secure</span>
          <span className="text-slate-400" aria-hidden="true">·</span>
          <span>Transparent</span>
          <span className="text-slate-400" aria-hidden="true">·</span>
          <span>Efficient</span>
        </div>

        <div className="hidden md:block flex-1 h-[1px] bg-slate-300/60 mx-6" />

        <div className="text-slate-600 font-medium shrink-0">
          © 2026 NLA. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
