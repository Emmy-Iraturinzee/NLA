import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { NlaLogo } from './NlaLogo';
import { TopographicBackground } from './TopographicBackground';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
  onBackToWelcome?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBackToWelcome }) => {
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
  const [username, setUsername] = useState('eiraturinze@gov.rw');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [channel, setChannel] = useState<'email' | 'authenticator'>('authenticator');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter your username and password.');
      return;
    }
    setErrorMsg('');
    setStep('verification');
    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 60);
  };

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }
    if (clean.length > 1) {
      // Handle paste
      const digits = clean.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      digits.forEach((d, idx) => {
        next[idx] = d;
      });
      setOtp(next);
      const focusIdx = Math.min(digits.length, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }
    const next = [...otp];
    next[index] = clean;
    setOtp(next);
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((d) => d.length === 1);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpComplete) {
      // Auto-fill convenience if user clicks Verify or show hint
      setErrorMsg('Enter the 6-digit verification code (or click Quick Fill below).');
      return;
    }
    setErrorMsg('');
    onLoginSuccess(username);
  };

  const fillDemoCode = () => {
    setOtp(['4', '8', '2', '9', '1', '0']);
    setErrorMsg('');
  };

  return (
    <TopographicBackground variant="login">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Main Split Card */}
        <div className="w-full max-w-[920px] min-h-[540px] rounded-[22px] overflow-hidden shadow-[0_24px_60px_rgba(15,23,42,0.38)] flex flex-col md:flex-row border border-white/25">
          {/* Left Frosted Glass Brand Panel */}
          <div
            className="w-full md:w-[43%] p-8 md:p-10 flex flex-col justify-between relative"
            style={{
              background:
                'linear-gradient(160deg, rgba(226, 236, 242, 0.72) 0%, rgba(124, 148, 152, 0.42) 48%, rgba(56, 79, 63, 0.56) 100%)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <NlaLogo />
              {onBackToWelcome && (
                <button
                  type="button"
                  onClick={onBackToWelcome}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg backdrop-blur-xs transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Welcome</span>
                </button>
              )}
            </div>

            <div className="my-12 md:my-auto md:pt-8">
              <h1 className="text-[28px] md:text-[31px] font-bold text-white leading-[1.22] tracking-tight drop-shadow-sm">
                Land Administration Information System
              </h1>
            </div>

            <div className="hidden md:block text-[11px] text-white/60 font-medium">
              Republic of Rwanda · Spatial &amp; Registry Portal
            </div>
          </div>

          {/* Right White Auth Form Panel */}
          <div className="w-full md:w-[57%] bg-white px-7 py-9 md:px-14 md:py-11 flex flex-col justify-center">
            {/* Stepper */}
            <div className="flex items-center justify-center gap-3 mb-7 text-[11px] font-semibold tracking-wider">
              <div className="flex items-center gap-2">
                {step === 'verification' ? (
                  <span className="w-5 h-5 rounded-full bg-[#E0F4FD] text-[#0298D8] flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-[#0298D8] text-white flex items-center justify-center text-[11px]">
                    1
                  </span>
                )}
                <span className={step === 'credentials' ? 'text-[#0F172A]' : 'text-[#0298D8]'}>
                  CREDENTIALS
                </span>
              </div>

              <div
                className={`w-8 h-[1.5px] ${
                  step === 'verification' ? 'bg-[#0298D8]' : 'bg-slate-200'
                }`}
              />

              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                    step === 'verification'
                      ? 'bg-[#0298D8] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </span>
                <span
                  className={
                    step === 'verification' ? 'text-[#0F172A]' : 'text-slate-400'
                  }
                >
                  VERIFICATION
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.form
                key="step-credentials"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleContinue}
                className="space-y-4 max-w-[380px] w-full mx-auto"
              >
                {/* Icon & Header */}
                <div className="text-center mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#EFF8FD] border border-[#D4ECFA] text-[#0298D8] flex items-center justify-center mx-auto mb-3.5">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in to access your workspace
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase mb-1.5">
                    USERNAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition"
                      placeholder="username@gov.rw"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition"
                      placeholder="Enter your password"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Send Code Via */}
                <div>
                  <label className="block text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase mb-1.5">
                    SEND CODE VIA
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer ${
                        channel === 'email'
                          ? 'border-[#0298D8] bg-[#F2FAFE]'
                          : 'border-slate-200 bg-[#F8FAFC] hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          channel === 'email'
                            ? 'border-[#0298D8]'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {channel === 'email' && (
                          <span className="w-2 h-2 rounded-full bg-[#0298D8]" />
                        )}
                      </span>
                      <div>
                        <div
                          className={`text-xs font-semibold ${
                            channel === 'email' ? 'text-[#0284C7]' : 'text-[#0F172A]'
                          }`}
                        >
                          Email
                        </div>
                        <div className="text-[10.5px] text-slate-400">Send to your inbox</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannel('authenticator')}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer ${
                        channel === 'authenticator'
                          ? 'border-[#0298D8] bg-[#F2FAFE]'
                          : 'border-slate-200 bg-[#F8FAFC] hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          channel === 'authenticator'
                            ? 'border-[#0298D8]'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {channel === 'authenticator' && (
                          <span className="w-2 h-2 rounded-full bg-[#0298D8]" />
                        )}
                      </span>
                      <div>
                        <div
                          className={`text-xs font-semibold ${
                            channel === 'authenticator' ? 'text-[#0284C7]' : 'text-[#0F172A]'
                          }`}
                        >
                          Authenticator
                        </div>
                        <div className="text-[10.5px] text-slate-400">Google Auth app</div>
                      </div>
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 text-center font-medium">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  className="w-full h-11 mt-2 rounded-xl bg-[#0298D8] hover:bg-[#0284C7] text-white text-sm font-semibold shadow-sm transition cursor-pointer"
                >
                  Continue
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step-verification"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleVerify}
                className="space-y-5 max-w-[380px] w-full mx-auto"
              >
                <div className="text-center">
                  <div className="w-11 h-11 rounded-xl bg-[#EFF8FD] border border-[#D4ECFA] text-[#0298D8] flex items-center justify-center mx-auto mb-3.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
                    Verification
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Code sent via{' '}
                    <span className="font-semibold text-[#0298D8]">
                      {channel === 'authenticator' ? 'Google Authenticator' : username}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {channel === 'authenticator'
                      ? 'Open your authenticator app'
                      : 'Check your email inbox for the 6-digit code'}
                  </p>
                </div>

                {/* 6 OTP Inputs */}
                <div className="flex items-center justify-center gap-2.5 py-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-13 text-center text-lg font-bold rounded-xl border bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#0298D8] focus:ring-2 focus:ring-[#0298D8]/15 transition font-mono-code ${
                        digit ? 'border-[#0298D8] bg-white' : 'border-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 text-center font-medium">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  className={`w-full h-11 rounded-xl text-white text-sm font-semibold transition cursor-pointer ${
                    isOtpComplete
                      ? 'bg-[#0298D8] hover:bg-[#0284C7] shadow-sm'
                      : 'bg-[#86D2F2] hover:bg-[#6BC6EE]'
                  }`}
                >
                  Verify &amp; Sign In
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setErrorMsg('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to credentials
                  </button>

                  <button
                    type="button"
                    onClick={fillDemoCode}
                    className="text-xs text-[#0298D8] hover:text-[#0284C7] font-medium cursor-pointer"
                  >
                    Fill demo code
                  </button>
                </div>
              </motion.form>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </TopographicBackground>
  );
};
