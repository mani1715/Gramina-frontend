import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import {
  ArrowLeft,
  Globe,
  Mic,
  MicOff,
  Plus,
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  X,
  Navigation,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ArrowUpDown,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  MessageCircle,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import GigChatModal from '../components/GigChatModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/* ─── Helpers ────────────────────────────────────────────────── */
const getWageNumber = (wage = '') => parseInt(String(wage || '').replace(/[^0-9]/g, '') || '0', 10);

const STATUS_CONFIG = {
  pending:  { label: { en: 'Pending',  te: 'పెండింగ్'  }, color: 'bg-amber-100 text-amber-700'  },
  accepted: { label: { en: 'Accepted', te: 'అంగీకరించబడింది' }, color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: { en: 'Rejected', te: 'తిరస్కరించబడింది' }, color: 'bg-red-100 text-red-700' },
};

/* ─── Component ──────────────────────────────────────────────── */
const GiveGigPage = () => {
  const { t, language, toggleLanguage, setLanguage } = useLanguage();
  const navigate = useNavigate();

  /* Jobs list */
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  /* Modals */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [jobToClose, setJobToClose] = useState(null);
  const [chatJob, setChatJob] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);

  /* Applicants */
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  /* Chat */
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatData, setChatData] = useState({ appId: null, recipientName: '', recipientId: '' });

  /* Voice (individual fields) */
  const [activeMicField, setActiveMicField] = useState(null);
  const activeMicRecognitionRef = useRef(null);
  const activeMicAccumulatedRef = useRef('');

  /* GPS */
  const [gettingLocation, setGettingLocation] = useState(false);

  /* Form */
  const [formData, setFormData] = useState({
    title: '', description: '', wage: '', location: '', date: ''
  });

  /* ── Fetch ──────────────────────────────────────────────────── */
  useEffect(() => {
    fetchMyJobs();
    return () => {
      stopAllRecognition();
    };
  }, []); // eslint-disable-line

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/my-jobs`, { withCredentials: true });
      setMyJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    setLoadingApplicants(true);
    try {
      const res = await axios.get(`${API_URL}/api/job-applicants/${jobId}`, { withCredentials: true });
      setApplicants(res.data);
    } catch {
      toast.error(language === 'en' ? 'Failed to load applicants' : 'దరఖాస్తుదారులను లోడ్ చేయడంలో విఫలమైంది');
    } finally {
      setLoadingApplicants(false);
    }
  };

  /* ── Filtered + Sorted jobs ─────────────────────────────────── */
  const displayedJobs = React.useMemo(() => {
    let list = [...myJobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(job =>
        String(job.title || '').toLowerCase().includes(q) ||
        String(job.location || '').toLowerCase().includes(q) ||
        String(job.description || '').toLowerCase().includes(q)
      );
    }

    switch (sortOption) {
      case 'wage_high': list.sort((a, b) => getWageNumber(b.wage) - getWageNumber(a.wage)); break;
      case 'wage_low':  list.sort((a, b) => getWageNumber(a.wage) - getWageNumber(b.wage)); break;
      case 'newest':    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest':    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'applicants_high': list.sort((a, b) => (b.applicantCount || 0) - (a.applicantCount || 0)); break;
      default: break;
    }
    return list;
  }, [myJobs, searchQuery, sortOption]);

  /* ── Stop voice ─────── */
  const stopAllRecognition = useCallback(() => {
    if (activeMicRecognitionRef.current) {
      try { activeMicRecognitionRef.current.abort(); } catch (_) {}
      activeMicRecognitionRef.current = null;
    }
    setActiveMicField(null);
  }, []);

  const formatFieldVoice = async (field, text) => {
    if (!text || (field !== 'wage' && field !== 'date')) return;
    try {
      const res = await axios.post(`${API_URL}/api/voice/format`, {
        field,
        transcript: text,
        language
      }, { withCredentials: true });
      if (res.data.formatted) {
        setFormData(prev => ({ ...prev, [field]: res.data.formatted }));
      }
    } catch (_) {}
  };

  /* ── Voice — individual field ────────────────────────────── */
  const toggleFieldVoice = useCallback((field) => {
    if (activeMicField === field) {
      stopAllRecognition();
      formatFieldVoice(field, activeMicAccumulatedRef.current);
      return;
    }

    stopAllRecognition();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error(language === 'en' ? 'Voice not supported' : 'వాయిస్ మద్దతు లేదు');
      return;
    }

    setActiveMicField(field);

    // Only descriptions should be appended. Wage, Date, etc should start fresh
    // so previous dictations don't accidentally come back if the field was manually cleared.
    if (field === 'description') {
      activeMicAccumulatedRef.current = formData[field] || '';
    } else {
      activeMicAccumulatedRef.current = '';
    }
    let currentField = field;
    
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = language === 'te' ? 'te-IN' : 'en-IN';

    rec.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }
      if (final) {
        activeMicAccumulatedRef.current = (activeMicAccumulatedRef.current + ' ' + final).trim();
        setFormData(prev => ({ ...prev, [currentField]: activeMicAccumulatedRef.current }));
      } else if (interim) {
        setFormData(prev => ({ ...prev, [currentField]: (activeMicAccumulatedRef.current + ' ' + interim).trim() }));
      }
    };

    rec.onend = () => {
      setTimeout(() => {
        if (activeMicRecognitionRef.current && activeMicRecognitionRef.current === rec) {
           try { activeMicRecognitionRef.current.start(); } catch (_) {}
        }
      }, 150);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setActiveMicField(null);
      }
    };

    activeMicRecognitionRef.current = rec;
    try { rec.start(); } catch (_) {}
  }, [activeMicField, formData, language, stopAllRecognition]);

  /* ── GPS auto-location ──────────────────────────────────────── */
  const getAutoLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(language === 'en' ? 'Geolocation not supported' : 'జియోలొకేషన్ మద్దతు లేదు');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Try reverse geocode via nominatim (free, no key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address;
          const parts = [
            addr.village || addr.suburb || addr.town || addr.city_district || addr.city,
            addr.state_district || addr.county,
            addr.state
          ].filter(Boolean);
          let locationText = parts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          if (language === 'te' && locationText) {
            try {
              toast.success('అనువదించబడుతోంది...', { id: 'translating', duration: 2000 });
              const transRes = await axios.post(`${API_URL}/api/voice/format`, {
                field: 'location_translate',
                transcript: locationText,
                language: 'te'
              }, { withCredentials: true });
              if (transRes.data.formatted) {
                locationText = transRes.data.formatted;
              }
            } catch (err) {
              console.error('Failed to translate location text', err);
            }
          }
          
          setFormData(prev => ({ ...prev, location: locationText }));
          toast.success(language === 'en' ? 'Location detected!' : 'స్థానం గుర్తించబడింది!');
        } catch {
          setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          toast.success(language === 'en' ? 'Location added!' : 'స్థానం జోడించబడింది!');
        }
        setGettingLocation(false);
      },
      () => {
        toast.error(language === 'en' ? 'Could not get location' : 'స్థానం పొందలేకపోయాం');
        setGettingLocation(false);
      },
      { timeout: 8000 }
    );
  }, [language]);

  /* ── Submit new or edit job ─────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.wage || !formData.location) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లను పూరించండి');
      return;
    }

    let latitude = null, longitude = null;
    if (navigator.geolocation && !editingJobId) {
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch (_) {}
    }

    try {
      if (editingJobId) {
        await axios.put(
          `${API_URL}/api/jobs/${editingJobId}`,
          formData,
          { withCredentials: true }
        );
        toast.success(language === 'en' ? 'Job updated successfully!' : 'ఉద్యోగం విజయవంతంగా నవీకరించబడింది!');
      } else {
        await axios.post(
          `${API_URL}/api/jobs`,
          { ...formData, latitude, longitude },
          { withCredentials: true }
        );
        toast.success(language === 'en' ? 'Job posted successfully!' : 'ఉద్యోగం విజయవంతంగా పోస్ట్ చేయబడింది!');
      }
      setShowAddModal(false);
      setEditingJobId(null);
      setFormData({ title: '', description: '', wage: '', location: '', date: '' });
      fetchMyJobs();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : (editingJobId ? 'Failed to update job' : 'Failed to post job'));
    }
  };

  /* ── Delete job ─────────────────────────────────────────────── */
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm(language === 'en' ? 'Delete this job?' : 'ఈ ఉద్యోగాన్ని తొలగించాలా?')) return;
    try {
      await axios.delete(`${API_URL}/api/jobs/${jobId}`, { withCredentials: true });
      toast.success(language === 'en' ? 'Job deleted!' : 'ఉద్యోగం తొలగించబడింది!');
      fetchMyJobs();
    } catch {
      toast.error(language === 'en' ? 'Failed to delete job' : 'ఉద్యోగాన్ని తొలగించడంలో విఫలమైంది');
    }
  };

  /* ── Recruitment toggle ─────────────────────────────────────── */
  const handleRecruitmentToggle = async (job) => {
    if (!job.recruitmentClosed) {
      // Opening → closing: show confirmation
      setJobToClose(job);
      setShowCloseConfirm(true);
    } else {
      // Closed → re-open: do it directly
      await updateRecruitmentStatus(job.id, false);
    }
  };

  const updateRecruitmentStatus = async (jobId, closed) => {
    try {
      await axios.put(
        `${API_URL}/api/jobs/${jobId}`,
        { recruitmentClosed: closed },
        { withCredentials: true }
      );
      setMyJobs(prev => prev.map(j => j.id === jobId ? { ...j, recruitmentClosed: closed } : j));
      toast.success(
        closed
          ? (language === 'en' ? 'Recruitment closed' : 'రిక్రూట్‌మెంట్ మూసివేయబడింది')
          : (language === 'en' ? 'Recruitment reopened' : 'రిక్రూట్‌మెంట్ తెరవబడింది')
      );
    } catch {
      toast.error(language === 'en' ? 'Failed to update status' : 'స్థితిని అప్‌డేట్ చేయడంలో విఫలమైంది');
    }
  };

  /* ── Applicant accept/reject ────────────────────────────────── */
  const updateApplicationStatus = async (appId, status) => {
    setUpdatingStatus(appId);
    try {
      await axios.patch(
        `${API_URL}/api/applications/${appId}/status`,
        { status },
        { withCredentials: true }
      );
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(
        status === 'accepted'
          ? (language === 'en' ? 'Applicant accepted!' : 'దరఖాస్తుదారు అంగీకరించబడింది!')
          : (language === 'en' ? 'Applicant rejected' : 'దరఖాస్తుదారు తిరస్కరించబడ్డారు')
      );
    } catch {
      toast.error(language === 'en' ? 'Failed to update status' : 'స్థితిని అప్‌డేట్ చేయడంలో విఫలమైంది');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openApplicantsModal = (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
    fetchApplicants(job.id);
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">{t('back')}</span>
          </button>
          <h1 className="font-bold text-lg text-slate-800">{t('giveGig')}</h1>
          <button onClick={toggleLanguage} data-testid="givegig-language-toggle" className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium text-sm">
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">

        {/* Post job button */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setShowAddModal(true); setEditingJobId(null); stopAllRecognition(); setFormData({ title: '', description: '', wage: '', location: '', date: '' }); }}
          data-testid="add-job-btn"
          className="w-full h-20 mb-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-8 h-8" strokeWidth={2.5} />
          {t('addJob')}
        </motion.button>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search my jobs...' : 'నా ఉద్యోగాలు వెతకండి...'}
              className="w-full h-11 pl-9 pr-4 bg-white border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="h-11 pl-9 pr-4 bg-white border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer font-medium text-slate-700 min-w-[180px]"
            >
              <option value="newest">{language === 'en' ? 'Newest First' : 'కొత్తవి మొదట'}</option>
              <option value="oldest">{language === 'en' ? 'Oldest First' : 'పాతవి మొదట'}</option>
              <option value="wage_high">{language === 'en' ? 'Wage: High → Low' : 'వేతనం: ఎక్కువ → తక్కువ'}</option>
              <option value="wage_low">{language === 'en' ? 'Wage: Low → High' : 'వేతనం: తక్కువ → ఎక్కువ'}</option>
              <option value="applicants_high">{language === 'en' ? 'Most Applicants' : 'ఎక్కువ దరఖాస్తులు'}</option>
            </select>
          </div>
        </div>

        {/* My Jobs List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">
            {t('myJobs')}
            {displayedJobs.length !== myJobs.length && (
              <span className="ml-2 text-sm font-normal text-slate-400">({displayedJobs.length} / {myJobs.length})</span>
            )}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : displayedJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <Plus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchQuery
                  ? (language === 'en' ? 'No jobs match your search' : 'వెతుకుతున్న ఉద్యోగాలు కనుగొనబడలేదు')
                  : (language === 'en' ? 'No jobs posted yet' : 'ఇంకా ఉద్యోగాలు పోస్ట్ చేయలేదు')}
              </p>
            </div>
          ) : (
            displayedJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`my-job-${job.id}`}
                className={`bg-white rounded-3xl p-5 border transition-all ${job.recruitmentClosed ? 'border-slate-200 opacity-70' : 'border-slate-100'}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>
                      {job.recruitmentClosed && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                          {language === 'en' ? 'Closed' : 'మూసివేయబడింది'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <IndianRupee className="w-4 h-4" />{job.wage}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-4 h-4" />{job.location}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-4 h-4" />{job.date}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Applicants */}
                    <button
                      onClick={() => openApplicantsModal(job)}
                      data-testid={`view-applicants-${job.id}`}
                      className="relative p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                      title={language === 'en' ? 'View Applicants' : 'దరఖాస్తుదారులు'}
                    >
                      <Users className="w-5 h-5" />
                      {job.applicantCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {job.applicantCount}
                        </span>
                      )}
                    </button>

                    {/* Edit Gig */}
                    <button
                      onClick={() => {
                        setEditingJobId(job.id);
                        setFormData({
                          title: job.title || '',
                          description: job.description || '',
                          wage: job.wage || '',
                          location: job.location || '',
                          date: job.date || ''
                        });
                        setShowAddModal(true);
                      }}
                      className="relative p-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-xl transition-colors"
                      title={language === 'en' ? 'Edit Gig' : 'సవరించు'}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>

                    {/* Chat with Applicants */}
                    <button
                      onClick={() => setChatJob(job)}
                      className="relative p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
                      title={language === 'en' ? 'Gig Messages' : 'గిగ్ సందేశాలు'}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>

                    {/* Recruitment toggle */}
                    <button
                      onClick={() => handleRecruitmentToggle(job)}
                      data-testid={`recruitment-toggle-${job.id}`}
                      title={job.recruitmentClosed
                        ? (language === 'en' ? 'Reopen Recruitment' : 'రిక్రూట్‌మెంట్ తెరవండి')
                        : (language === 'en' ? 'Close Recruitment' : 'రిక్రూట్‌మెంట్ మూసివేయండి')}
                      className={`p-3 rounded-xl transition-colors ${
                        job.recruitmentClosed
                          ? 'bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                          : 'bg-emerald-50 hover:bg-amber-50 text-emerald-600 hover:text-amber-600'
                      }`}
                    >
                      {job.recruitmentClosed
                        ? <ToggleLeft className="w-5 h-5" />
                        : <ToggleRight className="w-5 h-5" />
                      }
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      data-testid={`delete-job-${job.id}`}
                      className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Recruitment closed banner */}
                {job.recruitmentClosed && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    {language === 'en' ? 'Recruitment completed — this gig is no longer accepting applicants.' : 'రిక్రూట్‌మెంట్ పూర్తయింది — ఈ గిగ్ ఇకపై దరఖాస్తుదారులను స్వీకరించడం లేదు.'}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════
          ADD JOB MODAL
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-2 sm:p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingJobId ? (language === 'en' ? 'Edit Job' : 'ఉద్యోగాన్ని సవరించండి') : t('addJob')}
                </h2>
                <button onClick={() => { setShowAddModal(false); setEditingJobId(null); }} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                <span className="text-slate-600 font-semibold">{language === 'en' ? 'Form & Dictation Language:' : 'ఫారమ్ & డిక్టేషన్ భాష:'}</span>
                <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLanguage('te')}
                    className={`px-4 py-2 text-sm font-bold transition-colors ${language === 'te' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    తెలుగు
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 text-sm font-bold transition-colors ${language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('jobTitle')} *</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      data-testid="job-title-input"
                      className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleFieldVoice('title')}
                      className={`absolute right-2 p-2 rounded-xl transition-colors ${activeMicField === 'title' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-200 hover:text-emerald-600'}`}
                    >
                      {activeMicField === 'title' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('jobDescription')} *</label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required rows={3}
                      data-testid="job-description-input"
                      className="w-full p-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none resize-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleFieldVoice('description')}
                      className={`absolute right-2 top-2 p-2 rounded-xl transition-colors ${activeMicField === 'description' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-200 hover:text-emerald-600'}`}
                    >
                      {activeMicField === 'description' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('wage')} *</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={formData.wage}
                        onChange={e => setFormData(prev => ({ ...prev, wage: e.target.value }))}
                        required placeholder="₹500/day"
                        data-testid="job-wage-input"
                        className="w-full h-14 pl-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => toggleFieldVoice('wage')}
                        className={`absolute right-2 p-2 rounded-xl transition-colors ${activeMicField === 'wage' ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-200 hover:text-emerald-600'}`}
                      >
                        {activeMicField === 'wage' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('date')}</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      data-testid="job-date-input"
                      className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Location row with GPS + Mic */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('location')} *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      required
                      data-testid="job-location-input"
                      placeholder={language === 'en' ? 'Village / Town name' : 'గ్రామం / పట్టణం పేరు'}
                      className="flex-1 h-14 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 outline-none transition-all"
                    />
                    {/* GPS button */}
                    <button
                      type="button"
                      onClick={getAutoLocation}
                      disabled={gettingLocation}
                      data-testid="location-gps-btn"
                      title={language === 'en' ? 'Auto-detect location' : 'స్వయంచాలక స్థానం'}
                      className="w-14 h-14 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-60"
                    >
                      {gettingLocation
                        ? <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        : <Navigation className="w-5 h-5" />
                      }
                    </button>
                    {/* Mic button for location */}
                    <button
                      type="button"
                      onClick={() => toggleFieldVoice('location')}
                      data-testid="location-mic-btn"
                      title={language === 'en' ? 'Speak location' : 'స్థానం చెప్పండి'}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                        activeMicField === 'location'
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-600'
                      }`}
                    >
                      {activeMicField === 'location'
                        ? <MicOff className="w-5 h-5" />
                        : <Mic className="w-5 h-5" />
                      }
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="submit-job-btn"
                  className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xl transition-colors"
                >
                  {t('submit')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          APPLICANTS MODAL
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showApplicantsModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-2 sm:p-4"
            onClick={() => setShowApplicantsModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{t('applicants')}</h2>
                  {selectedJob && (
                    <p className="text-sm text-slate-500 truncate max-w-xs">{selectedJob.title}</p>
                  )}
                </div>
                <button onClick={() => setShowApplicantsModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors ml-4 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Applicant count summary */}
              {!loadingApplicants && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['pending', 'accepted', 'rejected'].map(s => {
                    const count = applicants.filter(a => a.status === s).length;
                    const cfg = STATUS_CONFIG[s];
                    return count > 0 ? (
                      <span key={s} className={`text-xs font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                        {count} {cfg.label[language === 'en' ? 'en' : 'te']}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {loadingApplicants ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t('noApplicants')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicants.map((applicant) => {
                    const cfg = STATUS_CONFIG[applicant.status] || STATUS_CONFIG.pending;
                    const isUpdating = updatingStatus === applicant.id;
                    return (
                      <div key={applicant.id} className="bg-slate-50 rounded-2xl p-4">
                        {/* Name + status */}
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <p className="font-semibold text-slate-800">{applicant.userName}</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${cfg.color}`}>
                            {applicant.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                            {applicant.status === 'accepted' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {applicant.status === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                            {cfg.label[language === 'en' ? 'en' : 'te']}
                          </span>
                        </div>

                        {/* Contact info */}
                        <div className="space-y-2 text-sm mb-4">
                          <a href={`tel:${applicant.phone}`} className="flex items-center gap-2 text-blue-600">
                            <Phone className="w-4 h-4" />{applicant.phone}
                          </a>
                          <a href={`mailto:${applicant.email}`} className="flex items-center gap-2 text-blue-600">
                            <Mail className="w-4 h-4" />{applicant.email}
                          </a>
                          <p className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4" />{applicant.area}
                          </p>
                          {applicant.bio && (
                            <p className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 mt-2 italic text-xs">
                              {applicant.bio}
                            </p>
                          )}
                        </div>

                        {/* Accept / Reject buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateApplicationStatus(applicant.id, 'accepted')}
                            disabled={isUpdating || applicant.status === 'accepted'}
                            className={`flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-colors ${
                              applicant.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 disabled:opacity-50'
                            }`}
                          >
                            {isUpdating ? <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" />{language === 'en' ? 'Accept' : 'అంగీకరించు'}</>}
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(applicant.id, 'rejected')}
                            disabled={isUpdating || applicant.status === 'rejected'}
                            className={`flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-colors ${
                              applicant.status === 'rejected'
                                ? 'bg-red-100 text-red-700 cursor-default'
                                : 'bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50'
                            }`}
                          >
                            {isUpdating ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <><XCircle className="w-4 h-4" />{language === 'en' ? 'Reject' : 'తిరస్కరించు'}</>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          CLOSE RECRUITMENT CONFIRMATION POPUP
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCloseConfirm && jobToClose && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowCloseConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                {language === 'en' ? 'Close Recruitment?' : 'రిక్రూట్‌మెంట్ మూసివేయాలా?'}
              </h3>
              <p className="text-slate-500 text-center text-sm mb-6">
                {language === 'en'
                  ? `"${jobToClose.title}" will no longer accept new applicants. You can re-enable it later.`
                  : `"${jobToClose.title}" కొత్త దరఖాస్తులు స్వీకరించదు. మీరు తర్వాత తిరిగి తెరవొచ్చు.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCloseConfirm(false); setJobToClose(null); }}
                  className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={async () => {
                    setShowCloseConfirm(false);
                    await updateRecruitmentStatus(jobToClose.id, true);
                    setJobToClose(null);
                  }}
                  className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-semibold transition-colors"
                >
                  {language === 'en' ? 'Close Recruitment' : 'మూసివేయండి'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Full Screen Gig Chat Modal */}
      <GigChatModal
        isOpen={!!chatJob}
        onClose={() => setChatJob(null)}
        job={chatJob}
      />

    </div>
  );
};

export default GiveGigPage;
