import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Globe, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';

const VerifyOTPPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error(language === 'en' ? 'Please enter complete OTP' : 'దయచేసి పూర్తి OTP నమోదు చేయండి');
      return;
    }

    setLoading(true);
    
    try {
      await verifyOTP(email, otp);
      toast.success(language === 'en' ? 'Email verified successfully!' : 'ఇమెయిల్ విజయవంతంగా ధృవీకరించబడింది!');
      navigate('/dashboard');
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    
    try {
      await resendOTP(email);
      toast.success(language === 'en' ? 'OTP sent successfully!' : 'OTP విజయవంతంగా పంపబడింది!');
      setCountdown(60);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/signup')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('back')}</span>
          </button>
          
          <button
            onClick={toggleLanguage}
            data-testid="otp-language-toggle"
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
              <Mail className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('verifyOTP')}</h1>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">{t('enterOTP')}</p>
            {email && (
              <p className="text-emerald-600 font-medium mt-2">{email}</p>
            )}
          </div>

          {/* OTP Input */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                data-testid="otp-input"
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-xl sm:text-2xl font-bold rounded-xl border-2"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Verify Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              data-testid="verify-otp-btn"
              className="w-full h-14 sm:h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg sm:text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('verifyOTP')
              )}
            </motion.button>

            {/* Resend Button */}
            <div className="mt-6 text-center">
              {countdown > 0 ? (
                <p className="text-slate-500">
                  {language === 'en' ? `Resend in ${countdown}s` : `${countdown}సె లో మళ్ళీ పంపండి`}
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  data-testid="resend-otp-btn"
                  className="flex items-center gap-2 mx-auto text-emerald-600 font-semibold hover:underline disabled:opacity-50"
                >
                  {resending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {t('resendOTP')}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default VerifyOTPPage;
