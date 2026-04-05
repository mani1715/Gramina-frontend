import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  ClipboardList,
  User,
  Info,
  Globe,
  LogOut,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    {
      icon: Search,
      title: t('findGig'),
      description: language === 'en' ? 'Search for work near you' : 'మీ సమీపంలో పని కోసం వెతకండి',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      path: '/find-gig'
    },
    {
      icon: Plus,
      title: t('giveGig'),
      description: language === 'en' ? 'Post a job with your voice' : 'మీ వాయిస్‌తో ఉద్యోగం పోస్ట్ చేయండి',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      path: '/give-gig'
    },
    {
      icon: ClipboardList,
      title: t('appliedGigs'),
      description: language === 'en' ? 'View your applications' : 'మీ దరఖాస్తులను చూడండి',
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      path: '/applied-gigs'
    },
    {
      icon: User,
      title: t('profile'),
      description: language === 'en' ? 'Manage your profile' : 'మీ ప్రొఫైల్ నిర్వహించండి',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      path: '/profile'
    },
    {
      icon: Info,
      title: t('about'),
      description: language === 'en' ? 'Learn about GramaMitra' : 'గ్రామ మిత్ర గురించి తెలుసుకోండి',
      color: 'bg-slate-500',
      bgColor: 'bg-slate-100',
      path: '/about'
    }
  ];

  const handleLogoutConfirmed = async () => {
    setShowLogoutConfirm(false);
    // Navigate first to avoid ProtectedRoute redirect race condition
    navigate('/', { replace: true });
    // Then clear the session
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-50 safe-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">G</span>
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-slate-800">{t('appName')}</h1>
              <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-none">
                {language === 'en' ? `Hello, ${user?.name || 'User'}` : `నమస్తే, ${user?.name || 'వినియోగదారు'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 pl-2">
            <button
              onClick={toggleLanguage}
              data-testid="dashboard-language-toggle"
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors font-medium text-xs sm:text-sm active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              data-testid="logout-btn"
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg sm:rounded-xl transition-colors font-medium text-xs sm:text-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <h2 className="text-xl sm:text-3xl font-bold text-slate-800">
            {t('dashboard')}
          </h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            {language === 'en' ? 'What would you like to do today?' : 'మీరు ఈ రోజు ఏమి చేయాలనుకుంటున్నారు?'}
          </p>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(item.path)}
              data-testid={`menu-${item.path.slice(1)}`}
              className={`${item.bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-left hover:shadow-lg transition-all active:scale-[0.97] border-2 border-transparent hover:border-slate-200`}
            >
              <div className={`${item.color} w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4`}>
                <item.icon className="w-6 h-6 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-base sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600 text-xs sm:text-base line-clamp-2">
                {item.description}
              </p>
            </motion.button>
          ))}
        </div>
      </main>

      {/* ══ Logout Confirmation Modal ══ */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-7 h-7 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                {language === 'en' ? 'Log Out?' : 'లాగ్ అవుట్ అవుతారా?'}
              </h3>
              <p className="text-slate-500 text-center text-sm mb-6">
                {language === 'en'
                  ? 'Are you sure you want to log out of GramaMitra?'
                  : 'మీరు గ్రామ మిత్ర నుండి లాగ్ అవుట్ అవ్వాలని నిర్ధారించారా?'}
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  data-testid="logout-cancel-btn"
                  className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleLogoutConfirmed}
                  data-testid="logout-confirm-btn"
                  className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
