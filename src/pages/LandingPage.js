import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MapPin, 
  Smartphone, 
  Users, 
  Search, 
  Link2, 
  CheckCircle,
  ChevronRight,
  Globe
} from 'lucide-react';

const LandingPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: Mic,
      title: t('voiceFeature'),
      description: t('voiceFeatureDesc'),
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: MapPin,
      title: t('locationFeature'),
      description: t('locationFeatureDesc'),
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Smartphone,
      title: t('easyApply'),
      description: t('easyApplyDesc'),
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Users,
      title: t('noMiddlemen'),
      description: t('noMiddlemenDesc'),
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50'
    }
  ];

  const steps = [
    {
      icon: Search,
      title: t('step1Title'),
      description: t('step1Desc'),
      number: '1'
    },
    {
      icon: Link2,
      title: t('step2Title'),
      description: t('step2Desc'),
      number: '2'
    },
    {
      icon: CheckCircle,
      title: t('step3Title'),
      description: t('step3Desc'),
      number: '3'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-xl">G</span>
            </div>
            <span className="font-bold text-lg sm:text-2xl text-slate-800">{t('appName')}</span>
          </motion.div>
          
          <div className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={toggleLanguage}
              data-testid="language-toggle"
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors font-medium text-xs sm:text-base active:scale-95"
            >
              <Globe className="w-3 h-3 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">{language === 'en' ? 'తెలుగు' : 'EN'}</span>
            </button>
            <button
              onClick={() => navigate('/signup')}
              data-testid="header-signup-btn"
              className="px-2 py-1.5 sm:px-6 sm:py-2 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg sm:rounded-xl font-semibold transition-colors text-xs sm:text-base active:scale-95"
            >
              {t('signup')}
            </button>
            <button
              onClick={() => navigate('/login')}
              data-testid="header-login-btn"
              className="px-2 py-1.5 sm:px-6 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg sm:rounded-xl font-semibold transition-colors text-xs sm:text-base active:scale-95"
            >
              {t('login')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/29858623/pexels-photo-29858623.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-3 sm:mb-6 tracking-tight leading-tight">
              {t('heroTitle')}
              <span className="text-emerald-400 block sm:inline"> {language === 'en' ? 'Instantly.' : 'వెంటనే.'}</span>
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-slate-200 mb-6 sm:mb-12 font-medium max-w-2xl mx-auto px-4">
              {t('heroSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                data-testid="hero-find-gig-btn"
                className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 py-4 sm:px-8 sm:py-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-bold text-base sm:text-xl shadow-lg shadow-blue-600/30 transition-all"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                {t('findGig')}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                data-testid="hero-give-gig-btn"
                className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 py-4 sm:px-8 sm:py-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-bold text-base sm:text-xl shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Mic className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                {t('giveGig')}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              {language === 'en' ? 'Why Choose GramaMitra?' : 'గ్రామ మిత్ర ఎందుకు ఎంచుకోవాలి?'}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${feature.bgColor} rounded-3xl p-6 sm:p-8 border-2 border-slate-100 hover:shadow-lg transition-shadow`}
              >
                <div className={`${feature.color} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}>
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              {t('howItWorks')}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center relative"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-base sm:text-lg max-w-xs mx-auto">
                  {step.description}
                </p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%]">
                    <div className="border-t-2 border-dashed border-emerald-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {language === 'en' ? 'Ready to Get Started?' : 'ప్రారంభించడానికి సిద్ధంగా ఉన్నారా?'}
            </h2>
            <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Join thousands of rural workers and employers connecting every day'
                : 'ప్రతిరోజూ కనెక్ట్ అవుతున్న వేలాది గ్రామీణ కార్మికులు మరియు యజమానులతో చేరండి'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/signup')}
              data-testid="cta-signup-btn"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-slate-50 text-emerald-700 rounded-2xl font-bold text-lg sm:text-xl shadow-lg transition-all"
            >
              {t('signup')}
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="font-bold text-xl">{t('appName')}</span>
            </div>
            
            <div className="flex items-center gap-6 sm:gap-8">
              <button onClick={() => navigate('/about')} className="text-slate-400 hover:text-white transition-colors">
                {t('footerAbout')}
              </button>
              <button className="text-slate-400 hover:text-white transition-colors">
                {t('footerContact')}
              </button>
              <button className="text-slate-400 hover:text-white transition-colors">
                {t('footerPrivacy')}
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} {t('appName')}. {t('footerRights')}.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
