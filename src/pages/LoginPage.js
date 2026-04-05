import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Globe, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(0); // 0=Login, 1=Email, 2=OTP+NewPw
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success(language === 'en' ? 'Login successful!' : 'లాగిన్ విజయవంతం!');
      navigate('/dashboard');
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (detail?.includes('not verified')) {
        setNeedsVerification(true);
        navigate('/verify-otp', { state: { email } });
      } else {
        toast.error(typeof detail === 'string' ? detail : 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      toast.success(language === 'en' ? 'OTP sent to your email' : 'OTP మీ ఇమెయిల్‌కి పంపబడింది');
      setForgotStep(2);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(forgotEmail, otp, newPassword);
      toast.success(language === 'en' ? 'Password reset successfully! Please login.' : 'పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది! దయచేసి లాగిన్ చేయండి.');
      setForgotStep(0);
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('back')}</span>
          </button>
          
          <button
            onClick={toggleLanguage}
            data-testid="login-language-toggle"
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
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('login')}</h1>
            <p className="text-slate-500 mt-2">{t('appName')}</p>
          </div>

          {/* Form */}
          {forgotStep === 0 && (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-14 sm:h-16 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-slate-700">{t('password')}</label>
                    <button 
                      type="button" 
                      onClick={() => { setForgotStep(1); setForgotEmail(email); }}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      {language === 'en' ? 'Forgot Password?' : 'పాస్‌వర్డ్ మర్చిపోయారా?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-14 sm:h-16 pl-12 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 sm:h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg sm:text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    t('login')
                  )}
                </motion.button>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-slate-500">
                  {t('noAccount')}{' '}
                  <Link to="/signup" className="text-emerald-600 font-semibold hover:underline">
                    {t('signup')}
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Forgot Password Step 1: Email */}
          {forgotStep === 1 && (
            <form onSubmit={handleForgotRequest} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{language === 'en' ? 'Reset Password' : 'పాస్‌వర్డ్ రీసెట్'}</h2>
              <p className="text-slate-600 text-sm mb-6">{language === 'en' ? "Enter your email address and we'll send you an OTP to reset your password." : "మీ ఇమెయిల్ నమోదు చేయండి. మేము మీ పాస్‌వర్డ్ రీసెట్ చేయడానికి OTP పంపుతాము."}</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full h-14 sm:h-16 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setForgotStep(0)} className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-colors">
                    {t('cancel')}
                  </button>
                  <button type="submit" disabled={loading || !forgotEmail} className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (language === 'en' ? 'Send OTP' : 'OTP పంపు')}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Forgot Password Step 2: OTP and New Password */}
          {forgotStep === 2 && (
            <form onSubmit={handleResetPassword} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{language === 'en' ? 'Create New Password' : 'కొత్త పాస్‌వర్డ్ సృష్టించండి'}</h2>
              <p className="text-slate-600 text-sm mb-6">{language === 'en' ? `Enter the 6-digit OTP sent to ${forgotEmail} along with your new password.` : `${forgotEmail} కి పంపిన 6-అంకెల OTP మరియు మీ కొత్త పాస్‌వర్డ్ నమోదు చేయండి.`}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="000000"
                    className="w-full h-14 text-center text-2xl font-bold tracking-[0.5em] bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{language === 'en' ? 'New Password' : 'కొత్త పాస్‌వర్డ్'}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {newPassword.length >= 6 && <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{language === 'en' ? 'Minimum 6 characters' : 'కనీసం 6 అక్షరాలు'}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setForgotStep(0)} className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-colors">
                    {t('cancel')}
                  </button>
                  <button type="submit" disabled={loading || otp.length < 6 || newPassword.length < 6} className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (language === 'en' ? 'Reset Password' : 'పాస్‌వర్డ్ రీసెట్')}
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default LoginPage;
