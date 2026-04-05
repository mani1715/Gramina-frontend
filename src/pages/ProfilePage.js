import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Globe,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  Shield,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/* ─── Section card wrapper ────────────────────────────────────── */
const SectionCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-sm ${className}`}
  >
    {children}
  </motion.div>
);

const ProfilePage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, updateProfile, changePassword, changeEmail, verifyEmailChange, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  /* ── Profile editing ─────────────────────────────────── */
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    area: user?.area || ''
  });

  /* ── Change Password ─────────────────────────────────── */
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [forgotPwStep, setForgotPwStep] = useState(false);
  const [forgotPwOtp, setForgotPwOtp] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [sendingForgotOtp, setSendingForgotOtp] = useState(false);

  /* ── Change Email ────────────────────────────────────── */
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [otpStep, setOtpStep] = useState(false);   // true = OTP entry screen
  const [otp, setOtp] = useState('');
  const [pendingNewEmail, setPendingNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [showEmailPw, setShowEmailPw] = useState(false);

  /* ── Handlers ────────────────────────────────────────── */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(formData);
      toast.success(t('profileUpdated'));
      setIsEditing(false);
    } catch {
      toast.error(language === 'en' ? 'Failed to update profile' : 'ప్రొఫైల్ అప్‌డేట్ చేయడంలో విఫలమైంది');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleForgotPassword = async () => {
    setSendingForgotOtp(true);
    try {
      await forgotPassword(user.email);
      setForgotPwStep(true);
      toast.success(language === 'en' ? `OTP sent to ${user.email}` : `OTP పంపబడింది`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to send OTP');
    } finally {
      setSendingForgotOtp(false);
    }
  };

  const handleForgotPwReset = async (e) => {
    e.preventDefault();
    if (forgotNewPw.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి');
      return;
    }
    setSavingPassword(true);
    try {
      await resetPassword(user.email, forgotPwOtp, forgotNewPw);
      toast.success(language === 'en' ? 'Password reset successfully!' : 'పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది!');
      setForgotPwStep(false);
      setForgotPwOtp('');
      setForgotNewPw('');
      setShowPasswordSection(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to reset password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPw !== passwordForm.confirm) {
      toast.error(language === 'en' ? 'New passwords do not match' : 'కొత్త పాస్‌వర్డ్‌లు సరిపోలడం లేదు');
      return;
    }
    if (passwordForm.newPw.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwordForm.current, passwordForm.newPw);
      toast.success(language === 'en' ? 'Password changed successfully!' : 'పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!');
      setPasswordForm({ current: '', newPw: '', confirm: '' });
      setShowPasswordSection(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : (language === 'en' ? 'Failed to change password' : 'పాస్‌వర్డ్ మార్చడంలో విఫలమైంది'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleEmailChangeRequest = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await changeEmail(emailForm.newEmail, emailForm.password);
      setPendingNewEmail(emailForm.newEmail);
      setOtpStep(true);
      toast.success(language === 'en' ? `OTP sent to ${emailForm.newEmail}` : `OTP ${emailForm.newEmail} కి పంపబడింది`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : (language === 'en' ? 'Failed to initiate email change' : 'ఇమెయిల్ మార్పు ప్రారంభించడంలో విఫలమైంది'));
    } finally {
      setSavingEmail(false);
    }
  };

  const handleEmailOtpVerify = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await verifyEmailChange(pendingNewEmail, otp);
      toast.success(language === 'en' ? 'Email changed successfully!' : 'ఇమెయిల్ విజయవంతంగా మార్చబడింది!');
      setShowEmailSection(false);
      setOtpStep(false);
      setOtp('');
      setEmailForm({ newEmail: '', password: '' });
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : (language === 'en' ? 'Invalid OTP' : 'తప్పు OTP'));
    } finally {
      setSavingEmail(false);
    }
  };

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">{t('back')}</span>
          </button>
          <h1 className="font-bold text-lg text-slate-800">{t('profile')}</h1>
          <button
            onClick={toggleLanguage}
            data-testid="profile-language-toggle"
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium text-sm"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">

        {/* ── Avatar + Name card ── */}
        <SectionCard>
          <div className="text-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/20">
              <span className="text-white font-bold text-3xl sm:text-4xl">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
              {user?.role === 'admin' ? 'Admin' : (language === 'en' ? 'Member' : 'సభ్యుడు')}
            </span>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSave} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t('name')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  data-testid="profile-name-input"
                  className="w-full h-13 py-3 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base focus:border-emerald-500 outline-none disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Email display (read-only — changed below) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full h-13 py-3 pl-12 pr-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-base opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t('phone')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  data-testid="profile-phone-input"
                  className="w-full h-13 py-3 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base focus:border-emerald-500 outline-none disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t('area')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.area}
                  onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  disabled={!isEditing}
                  data-testid="profile-area-input"
                  className="w-full h-13 py-3 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base focus:border-emerald-500 outline-none disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Edit / Save buttons */}
            {isEditing ? (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setFormData({ name: user?.name || '', phone: user?.phone || '', area: user?.area || '' }); }}
                  className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  data-testid="save-profile-btn"
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingProfile ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" />{t('save')}</>}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                data-testid="edit-profile-btn"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />{t('editProfile')}
              </button>
            )}
          </form>
        </SectionCard>

        {/* ── Security section ── */}
        <SectionCard>
          <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slateald-500" />
            {language === 'en' ? 'Account Security' : 'ఖాతా భద్రత'}
          </h3>

          <div className="space-y-2">
            {/* Change Password  */}
            <button
              onClick={() => { setShowPasswordSection(v => !v); setShowEmailSection(false); setForgotPwStep(false); }}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{language === 'en' ? 'Change Password' : 'పాస్‌వర్డ్ మార్చండి'}</p>
                  <p className="text-xs text-slate-500">{language === 'en' ? 'Update your login password' : 'మీ లాగిన్ పాస్‌వర్డ్ నవీకరించండి'}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showPasswordSection ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showPasswordSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {!forgotPwStep ? (
                    <form onSubmit={handlePasswordChange} className="px-1 pt-2 pb-1 space-y-3">
                      {/* Current password */}
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                        required
                        placeholder={language === 'en' ? 'Current password' : 'ప్రస్తుత పాస్‌వర్డ్'}
                        className="w-full h-12 pl-11 pr-11 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:border-purple-400 outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* New password */}
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordForm.newPw}
                        onChange={e => setPasswordForm(p => ({ ...p, newPw: e.target.value }))}
                        required
                        placeholder={language === 'en' ? 'New password (min 6 chars)' : 'కొత్త పాస్‌వర్డ్ (కనీసం 6)'}
                        className="w-full h-12 pl-11 pr-11 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:border-purple-400 outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Confirm new password */}
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                        required
                        placeholder={language === 'en' ? 'Confirm new password' : 'కొత్త పాస్‌వర్డ్ నిర్ధారించండి'}
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:border-purple-400 outline-none transition-all"
                      />
                      {passwordForm.confirm && passwordForm.newPw === passwordForm.confirm && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      )}
                    </div>

                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingPassword ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{language === 'en' ? 'Update Password' : 'పాస్‌వర్డ్ నవీకరించండి'}</>}
                      </button>

                      <div className="text-center pt-2">
                        <button 
                          type="button" 
                          onClick={handleForgotPassword}
                          disabled={sendingForgotOtp}
                          className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          {sendingForgotOtp ? (language === 'en' ? 'Sending OTP...' : 'OTP పంపుతోంది...') : (language === 'en' ? 'Forgot your password?' : 'మీ పాస్‌వర్డ్ మర్చిపోయారా?')}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotPwReset} className="px-1 pt-2 pb-1 space-y-3">
                      <p className="text-sm text-slate-600 bg-purple-50 rounded-xl px-4 py-3">
                        {language === 'en' 
                          ? `We sent a 6-digit OTP to ${user.email}.` 
                          : `మేము ${user.email} కి 6-అంకె OTP పంపాము.`}
                      </p>
                      
                      <input
                        type="text"
                        maxLength={6}
                        value={forgotPwOtp}
                        onChange={e => setForgotPwOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="000000"
                        className="w-full h-14 text-center text-2xl font-bold tracking-[0.5em] bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none transition-all"
                      />

                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={forgotNewPw}
                          onChange={e => setForgotNewPw(e.target.value)}
                          required
                          placeholder={language === 'en' ? 'New password' : 'కొత్త పాస్‌వర్డ్'}
                          className="w-full h-12 pl-11 pr-11 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:border-purple-400 outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => { setForgotPwStep(false); setForgotPwOtp(''); setForgotNewPw(''); }} className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                          {t('cancel')}
                        </button>
                        <button type="submit" disabled={savingPassword || forgotPwOtp.length < 6} className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-1">
                          {savingPassword ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{language === 'en' ? 'Reset Password' : 'రీసెట్'}</>}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Change Email */}
            <button
              onClick={() => { setShowEmailSection(v => !v); setShowPasswordSection(false); setOtpStep(false); setOtp(''); setEmailForm({ newEmail: '', password: '' }); }}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{language === 'en' ? 'Change Email' : 'ఇమెయిల్ మార్చండి'}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[160px] sm:max-w-xs">{user?.email}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${showEmailSection ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showEmailSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {!otpStep ? (
                    <form onSubmit={handleEmailChangeRequest} className="px-1 pt-2 pb-1 space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={emailForm.newEmail}
                          onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
                          required
                          placeholder={language === 'en' ? 'New email address' : 'కొత్త ఇమెయిల్ చిరునామా'}
                          className="w-full h-12 pl-11 pr-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showEmailPw ? 'text' : 'password'}
                          value={emailForm.password}
                          onChange={e => setEmailForm(p => ({ ...p, password: e.target.value }))}
                          required
                          placeholder={language === 'en' ? 'Confirm your password' : 'మీ పాస్‌వర్డ్ నిర్ధారించండి'}
                          className="w-full h-12 pl-11 pr-11 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowEmailPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                          {showEmailPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={savingEmail}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingEmail ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{language === 'en' ? 'Send Verification OTP' : 'OTP పంపండి'}</>}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailOtpVerify} className="px-1 pt-2 pb-1 space-y-3">
                      <p className="text-sm text-slate-600 bg-blue-50 rounded-xl px-4 py-3">
                        {language === 'en'
                          ? `We sent a 6-digit OTP to ${pendingNewEmail}. Enter it below to confirm.`
                          : `మేము ${pendingNewEmail} కి 6-అంకె OTP పంపాము. నిర్ధారించడానికి దిగువ నమోదు చేయండి.`}
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="000000"
                        className="w-full h-14 text-center text-2xl font-bold tracking-[0.5em] bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 outline-none transition-all"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setOtpStep(false); setOtp(''); }} className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                          {t('cancel')}
                        </button>
                        <button type="submit" disabled={savingEmail || otp.length < 6} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-1">
                          {savingEmail ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" />{language === 'en' ? 'Verify' : 'ధృవీకరించు'}</>}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>

      </main>
    </div>
  );
};

export default ProfilePage;
