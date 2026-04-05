import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Globe, ArrowLeft, User, Phone, MapPin, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SignupPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    area: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get address
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`
          );
          const data = await response.json();
          
          // Extract location name
          const address = data.address || {};
          const locationName = address.village || address.town || address.city || 
                              address.suburb || address.county || address.state_district || '';
          
          if (locationName) {
            setFormData(prev => ({ ...prev, area: locationName }));
            toast.success(language === 'en' ? 'Location detected!' : 'స్థానం గుర్తించబడింది!');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.log('Location error:', error);
        setDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు');
      return;
    }

    if (formData.password.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి');
      return;
    }
    
    setLoading(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        area: formData.area
      });
      toast.success(language === 'en' ? 'Registration successful! Please verify your email.' : 'రిజిస్ట్రేషన్ విజయవంతం! దయచేసి మీ ఇమెయిల్‌ని ధృవీకరించండి.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('back')}</span>
          </button>
          
          <button
            onClick={toggleLanguage}
            data-testid="signup-language-toggle"
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium text-sm active:scale-95"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 rounded-2xl mb-3">
              <span className="text-white font-bold text-xl sm:text-2xl">G</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('signup')}</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">{t('appName')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('name')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    data-testid="signup-name-input"
                    className="w-full h-12 sm:h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder={language === 'en' ? 'Your name' : 'మీ పేరు'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    data-testid="signup-email-input"
                    className="w-full h-12 sm:h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    data-testid="signup-phone-input"
                    className="w-full h-12 sm:h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Area with Auto-detect */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('area')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    data-testid="signup-area-input"
                    className="w-full h-12 sm:h-14 pl-12 pr-14 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder={language === 'en' ? 'Your village/area' : 'మీ గ్రామం/ప్రాంతం'}
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    data-testid="detect-location-btn"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors active:scale-95 disabled:opacity-50"
                    title={language === 'en' ? 'Detect Location' : 'స్థానం గుర్తించండి'}
                  >
                    {detectingLocation ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1">
                  {language === 'en' ? 'Tap icon to auto-detect' : 'ఆటో-డిటెక్ట్ కోసం ఐకాన్ నొక్కండి'}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    data-testid="signup-password-input"
                    className="w-full h-12 sm:h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:scale-95"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    data-testid="signup-confirm-password-input"
                    className="w-full h-12 sm:h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base sm:text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                data-testid="signup-submit-btn"
                className="w-full h-14 sm:h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg sm:text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 active:bg-emerald-800"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t('signup')
                )}
              </motion.button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-500">
                {t('haveAccount')}{' '}
                <Link to="/login" className="text-emerald-600 font-semibold hover:underline active:text-emerald-700">
                  {t('login')}
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default SignupPage;
