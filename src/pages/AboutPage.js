import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  ArrowLeft, 
  Globe, 
  Heart,
  Target,
  Users,
  Mic
} from 'lucide-react';

const AboutPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: Mic,
      title: language === 'en' ? 'Voice-First' : 'వాయిస్-ఫస్ట్',
      description: language === 'en' 
        ? 'Post jobs by speaking in your language - no typing needed'
        : 'మీ భాషలో మాట్లాడి ఉద్యోగాలు పోస్ట్ చేయండి - టైపింగ్ అవసరం లేదు'
    },
    {
      icon: Users,
      title: language === 'en' ? 'Direct Connection' : 'డైరెక్ట్ కనెక్షన్',
      description: language === 'en'
        ? 'Connect workers and employers directly without middlemen'
        : 'మధ్యవర్తులు లేకుండా కార్మికులను మరియు యజమానులను నేరుగా కనెక్ట్ చేయండి'
    },
    {
      icon: Target,
      title: language === 'en' ? 'Location Smart' : 'లొకేషన్ స్మార్ట్',
      description: language === 'en'
        ? 'Find jobs near you using GPS technology'
        : 'GPS టెక్నాలజీ ఉపయోగించి మీకు సమీపంలో ఉద్యోగాలు కనుగొనండి'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">{t('back')}</span>
          </button>
          
          <h1 className="font-bold text-lg text-slate-800">{t('about')}</h1>
          
          <button
            onClick={toggleLanguage}
            data-testid="about-language-toggle"
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium text-sm"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl mb-4">
            <span className="text-white font-bold text-3xl">G</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            {t('aboutTitle')}
          </h1>
        </motion.div>

        {/* About Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 mb-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">{t('ourMission')}</h2>
              <p className="text-slate-600 leading-relaxed">
                {t('missionDesc')}
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            {t('aboutDesc')}
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-slate-400 text-sm"
        >
          <p>{t('appName')} v1.0.0</p>
          <p>© {new Date().getFullYear()} {t('footerRights')}</p>
        </motion.div>
      </main>
    </div>
  );
};

export default AboutPage;
