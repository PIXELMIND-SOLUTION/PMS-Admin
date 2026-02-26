import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff, MdEmail, MdLock, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email) return;
    
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setShowOtpModal(true);
      // Auto-focus first OTP input after modal opens
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    }, 1500);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter complete 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    
    // Simulate verification delay
    setTimeout(() => {
      // Static OTP verification - accept any 6-digit code for demo
      if (otpString.length === 6) {
        sessionStorage.setItem(
          'adminDetails',
          JSON.stringify({
            email: formData.email,
            adminId: 'admin_' + Math.random().toString(36).substr(2, 9),
            adminName: formData.email.split('@')[0],
          })
        );
        onLogin();
        navigate('/dashboard');
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
      setOtpLoading(false);
    }, 1500);
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    
    // Simulate resend delay
    setTimeout(() => {
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setOtpLoading(false);
      // Focus first input
      document.getElementById('otp-0')?.focus();
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#001a1a] via-[#003333] via-[#005555] to-[#008b8b]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full animate-[floatOrb1_8s_ease-in-out_infinite]"
          style={{
            width: 500,
            height: 500,
            top: -150,
            left: -150,
            background: 'radial-gradient(circle,rgba(0,139,139,0.28) 0%,transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full animate-[floatOrb2_10s_ease-in-out_2s_infinite]"
          style={{
            width: 400,
            height: 400,
            bottom: -110,
            right: -110,
            background: 'radial-gradient(circle,rgba(0,255,200,0.14) 0%,transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full animate-[floatOrb3_7s_ease-in-out_1s_infinite]"
          style={{
            width: 230,
            height: 230,
            top: '38%',
            right: '12%',
            background: 'radial-gradient(circle,rgba(255,165,0,0.1) 0%,transparent 70%)',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,139,139,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,139,139,0.06) 1px,transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      {/* Large watermark logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none animate-[fadeIn_1.2s_ease_0.3s_both]">
        <img
          src="/logo.png"
          alt=""
          className="w-[940px] max-w-[78vw] opacity-5 brightness-[12] object-contain"
        />
      </div>

      {/* Square glass card */}
      <div className="relative z-10 w-full px-5 max-w-[680px] animate-[slideUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div
          className="rounded-3xl p-10 aspect-square flex flex-col justify-center"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          {/* Small logo inside card */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-48 object-contain brightness-[20] opacity-92"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-white text-2xl font-bold tracking-tight mb-1">
              Admin
            </h1>
            <p className="text-xs text-white/50">
              Sign in to manage your projects
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="animate-[errIn_0.3s_ease_both] flex items-center gap-3 rounded-xl px-4 py-2.5 mb-4 text-sm font-medium bg-red-500/15 border border-red-500/30 text-red-300">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[10px] font-semibold uppercase tracking-widest text-white/55 ml-1"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center pointer-events-none">
                  <MdEmail
                    className={`text-lg transition-colors duration-300 ${
                      focusedField === 'email' ? 'text-[#00e5cc]' : 'text-[#00e5cc]'
                    }`}
                  />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="your@email.com"
                  required
                  className="w-full py-3.5 pl-12 pr-4 text-white text-sm bg-transparent border border-white/13 rounded-xl outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#00e5cc]/70 focus:bg-white/11 focus:shadow-[0_0_0_3px_rgba(0,229,204,0.12)] autofill:shadow-[inset_0_0_0_1000px_#003535] autofill:text-fill-white"
                />
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white/50 group">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 cursor-pointer rounded border-white/30 bg-white/10 checked:bg-[#00e5cc] checked:border-[#00e5cc] focus:ring-0 focus:ring-offset-0 transition-colors duration-200"
                />
                <span className="group-hover:text-white/70 transition-colors duration-200">Remember me</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 text-white text-sm font-bold tracking-wide rounded-xl bg-gradient-to-r from-[#00b3b3] to-[#008b8b] hover:from-[#00c4c4] hover:to-[#009999] shadow-[0_8px_20px_rgba(0,139,139,0.35)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_28px_rgba(0,139,139,0.45)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,139,139,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_rgba(0,139,139,0.35)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                'Send OTP'
              )}
            </button>

            {/* Support */}
            <p className="text-center text-xs mt-2 text-white/40">
              Don't have an account?{' '}
              <a href="#" className="text-[#00e5cc] font-semibold hover:text-[#00e5cc]/80 hover:underline transition-all duration-200">
                Contact support
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease]">
          <div className="relative w-full max-w-md">
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'rgba(10, 25, 25, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,229,204,0.2)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              }}
            >
              {/* Back button */}
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp(['', '', '', '', '', '']);
                  setOtpError('');
                }}
                className="absolute top-4 left-4 text-white/50 hover:text-[#00e5cc] transition-colors duration-200"
              >
                <MdArrowBack size={20} />
              </button>

              {/* Modal header */}
              <div className="text-center mb-8">
                <h3 className="text-white text-xl font-bold mb-2">Enter OTP</h3>
                <p className="text-sm text-white/50">
                  We've sent a 6-digit code to<br />
                  <span className="text-[#00e5cc] font-medium">{formData.email}</span>
                </p>
                <p className="text-xs text-white/30 mt-2">
                  (For demo, any 6-digit code works)
                </p>
              </div>

              {/* OTP Error */}
              {otpError && (
                <div className="flex items-center gap-2 rounded-lg px-4 py-2 mb-6 text-sm bg-red-500/15 border border-red-500/30 text-red-300">
                  <span>⚠️</span>
                  <span>{otpError}</span>
                </div>
              )}

              {/* OTP Input Form */}
              <form onSubmit={handleOtpSubmit}>
                <div className="flex justify-between gap-2 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-14 h-14 text-center text-white text-2xl font-bold bg-white/5 border border-white/13 rounded-xl outline-none transition-all duration-300 focus:border-[#00e5cc]/70 focus:bg-white/11 focus:shadow-[0_0_0_3px_rgba(0,229,204,0.12)]"
                      autoFocus={index === 0}
                      disabled={otpLoading}
                    />
                  ))}
                </div>

                {/* Resend and Verify buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="w-full py-3 text-sm font-medium text-[#00e5cc] bg-white/5 border border-[#00e5cc]/30 rounded-xl hover:bg-[#00e5cc]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? 'Sending...' : 'Resend OTP'}
                  </button>

                  <button
                    type="submit"
                    disabled={otpLoading || otp.join('').length !== 6}
                    className="w-full py-3 text-white text-sm font-bold tracking-wide rounded-xl bg-gradient-to-r from-[#00b3b3] to-[#008b8b] hover:from-[#00c4c4] hover:to-[#009999] shadow-[0_8px_20px_rgba(0,139,139,0.35)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes floatOrb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-40px) scale(1.06); }
          66%      { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-40px,-30px) scale(1.08); }
        }
        @keyframes floatOrb3 {
          0%,100% { transform: translate(0,0); }
          50%     { transform: translate(20px,-25px); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(40px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes errIn {
          from { opacity:0; transform:translateX(-10px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;