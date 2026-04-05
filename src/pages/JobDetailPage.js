import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  IndianRupee,
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle,
  Mic,
  MicOff,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const ENV_API_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = ENV_API_URL === 'undefined' || !ENV_API_URL ? '' : ENV_API_URL;

const JobDetailPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    area: '',
    bio: ''
  });
  
  const [activeMicField, setActiveMicField] = useState(null);
  const recognitionRef = useRef(null);
  const accumulatedRef = useRef('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
    };
  }, []);

  const toggleVoiceInput = useCallback((field) => {
    if (activeMicField === field) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      setActiveMicField(null);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error(language === 'en' ? 'Voice not supported on this browser. Please use Chrome or Safari.' : 'ఈ బ్రౌజర్‌లో వాయిస్ మద్దతు లేదు. దయచేసి Chrome లేదా Safari ఉపయోగించండి.');
      return;
    }

    // Check for HTTPS (required for mobile)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      toast.error(language === 'en' ? 'Voice requires HTTPS connection' : 'వాయిస్‌కు HTTPS కనెక్షన్ అవసరం');
      return;
    }

    setActiveMicField(field);
    accumulatedRef.current = formData[field] || '';
    
    // Store current active field in a local var so onend closure captures it for loop check
    let currentField = field;

    const rec = new SR();
    rec.continuous = false; // Short-burst loop for reliability on mobile
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    
    // Set language based on current selection - support both Telugu and English
    rec.lang = language === 'te' ? 'te-IN' : 'en-IN';

    rec.onstart = () => {
      console.log('Speech recognition started for field:', field, 'Language:', rec.lang);
    };

    rec.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }
      if (final) {
        accumulatedRef.current = (accumulatedRef.current + ' ' + final).trim();
        setFormData(prev => ({ ...prev, [currentField]: accumulatedRef.current }));
      } else if (interim) {
        setFormData(prev => ({ ...prev, [currentField]: (accumulatedRef.current + ' ' + interim).trim() }));
      }
    };

    rec.onend = () => {
      // On mobile, don't auto-restart too aggressively
      setTimeout(() => {
         if (recognitionRef.current && recognitionRef.current === rec) {
           try { 
             recognitionRef.current.start(); 
           } catch (e) {
             console.log('Could not restart recognition:', e);
             setActiveMicField(null);
           }
         }
      }, 300); // Increased delay for mobile
    };

    rec.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') {
        toast.error(language === 'en' ? 'Microphone access denied. Please allow microphone in browser settings.' : 'మైక్రోఫోన్ యాక్సెస్ నిరాకరించబడింది. బ్రౌజర్ సెట్టింగ్స్‌లో మైక్రోఫోన్‌ను అనుమతించండి.');
        setActiveMicField(null);
      } else if (e.error === 'no-speech') {
        // No speech detected - this is normal, just restart
        console.log('No speech detected, will restart');
      } else if (e.error === 'network') {
        toast.error(language === 'en' ? 'Network error. Please check your internet connection.' : 'నెట్‌వర్క్ ఎర్రర్. మీ ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి.');
        setActiveMicField(null);
      } else if (e.error === 'audio-capture') {
        toast.error(language === 'en' ? 'No microphone found. Please connect a microphone.' : 'మైక్రోఫోన్ కనుగొనబడలేదు. మైక్రోఫోన్ కనెక్ట్ చేయండి.');
        setActiveMicField(null);
      } else if (e.error === 'aborted') {
        // User or system aborted - normal behavior
        console.log('Recognition aborted');
      } else {
        toast.error(language === 'en' ? `Voice error: ${e.error}` : `వాయిస్ ఎర్రర్: ${e.error}`);
        setActiveMicField(null);
      }
    };

    rec.onnomatch = () => {
      console.log('No speech match found');
    };

    recognitionRef.current = rec;
    try { 
      rec.start(); 
      toast.success(language === 'en' ? 'Listening... Speak now!' : 'వింటోంది... ఇప్పుడు మాట్లాడండి!', { duration: 2000 });
    } catch (e) {
      console.error('Failed to start recognition:', e);
      toast.error(language === 'en' ? 'Could not start voice input. Please try again.' : 'వాయిస్ ఇన్‌పుట్ ప్రారంభించలేకపోయింది. దయచేసి మళ్ళీ ప్రయత్నించండి.');
      setActiveMicField(null);
    }
  }, [activeMicField, formData, language]);

  useEffect(() => {
    fetchJob();
    checkIfApplied();
  }, [jobId]);

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        email: user.email || '',
        area: user.area || ''
      });
    }
  }, [user]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/${jobId}`, { withCredentials: true });
      setJob(response.data);
    } catch (error) {
      toast.error(language === 'en' ? 'Job not found' : 'ఉద్యోగం కనుగొనబడలేదు');
      navigate('/find-gig');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/my-applications`, {
        withCredentials: true
      });
      const applied = response.data.some(app => app.jobId === jobId);
      setHasApplied(applied);
    } catch (error) {
      // User might not be logged in
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      await axios.post(
        `${API_URL}/api/applications`,
        {
          jobId,
          phone: formData.phone,
          email: formData.email,
          area: formData.area,
          bio: formData.bio
        },
        { withCredentials: true }
      );
      toast.success(language === 'en' ? 'Application submitted!' : 'దరఖాస్తు సమర్పించబడింది!');
      setHasApplied(true);
      setShowApplyForm(false);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/find-gig')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('back')}</span>
          </button>
          
          <button
            onClick={toggleLanguage}
            data-testid="jobdetail-language-toggle"
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium text-sm"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Job Details */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
            {job?.title}
          </h1>

          {/* Job Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
              <IndianRupee className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm text-slate-500">{t('wage')}</p>
                <p className="text-xl font-bold text-emerald-600">{job?.wage}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">{t('location')}</p>
                <p className="text-lg font-semibold text-slate-800">{job?.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <Calendar className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-sm text-slate-500">{t('date')}</p>
                <p className="text-lg font-semibold text-slate-800">{job?.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <User className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-slate-500">{language === 'en' ? 'Posted by' : 'పోస్ట్ చేసినవారు'}</p>
                <p className="text-lg font-semibold text-slate-800">{job?.createdByName}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-3">{t('jobDescription')}</h2>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {job?.description}
            </p>
          </div>

          {/* Apply Button / Form */}
          {hasApplied ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-emerald-50 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">{t('alreadyApplied')}</span>
            </div>
          ) : showApplyForm ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleApply}
              className="space-y-4 p-4 bg-slate-50 rounded-2xl"
            >
              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('phone')}
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    data-testid="apply-phone-input"
                    className="w-full h-14 pl-12 pr-12 bg-white border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('phone')}
                    className={`absolute right-2 p-2 rounded-xl transition-colors ${activeMicField === 'phone' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'}`}
                  >
                    {activeMicField === 'phone' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('email')}
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    data-testid="apply-email-input"
                    className="w-full h-14 pl-12 pr-12 bg-white border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('email')}
                    className={`absolute right-2 p-2 rounded-xl transition-colors ${activeMicField === 'email' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'}`}
                  >
                    {activeMicField === 'email' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Area Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('area')}
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    required
                    data-testid="apply-area-input"
                    className="w-full h-14 pl-12 pr-12 bg-white border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('area')}
                    className={`absolute right-2 p-2 rounded-xl transition-colors ${activeMicField === 'area' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'}`}
                  >
                    {activeMicField === 'area' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'en' ? 'Job Bio / Details' : 'ఉద్యోగ వివరాలు / బయో'}
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    placeholder={language === 'en' ? 'Describe your skills and why you are a good fit...' : 'మీ నైపుణ్యాలను మరియు మీరు ఈ ఉద్యోగానికి ఎందుకు సరైన వారో వివరించండి...'}
                    className="w-full py-3 pl-12 pr-12 bg-white border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVoiceInput('bio')}
                    className={`absolute right-2 top-2 p-2 rounded-xl transition-colors ${activeMicField === 'bio' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'}`}
                  >
                    {activeMicField === 'bio' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 h-14 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  data-testid="submit-application-btn"
                  className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold disabled:opacity-50"
                >
                  {applying ? '...' : t('submit')}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowApplyForm(true)}
              data-testid="apply-now-btn"
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xl transition-colors"
            >
              {t('applyNow')}
            </motion.button>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default JobDetailPage;
