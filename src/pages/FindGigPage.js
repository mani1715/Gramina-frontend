import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Globe, 
  Search, 
  MapPin, 
  IndianRupee,
  Calendar,
  Filter,
  X,
  Navigation,
  User,
  Briefcase,
  Languages,
  ArrowUpDown
} from 'lucide-react';
import { Slider } from '../components/ui/slider';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

const ENV_API_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = ENV_API_URL === 'undefined' || !ENV_API_URL ? '' : ENV_API_URL;

const getWageNumber = (wage = '') => parseInt(String(wage || '').replace(/[^0-9]/g, '') || '0', 10);

const FindGigPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const { translate, translating } = useTranslation();
  
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]); // translated view
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [distanceFilter, setDistanceFilter] = useState(100);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [sortOption, setSortOption] = useState('newest');

  // Fetch all jobs on mount
  useEffect(() => {
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/jobs`);
      const data = Array.isArray(response.data) ? response.data : (response.data?.jobs || response.data?.data || []);
      setAllJobs(data);
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error(language === 'en' ? 'Failed to load jobs' : 'ఉద్యోగాలు లోడ్ చేయడంలో విఫలమైంది');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs when search or filters change
  useEffect(() => {
    filterJobs();
  }, [searchQuery, budgetRange, distanceFilter, userLocation, allJobs, sortOption]);

  const filterJobs = () => {
    let filtered = [...allJobs];

    // Search by title, description, or location
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        String(job.title || '').toLowerCase().includes(query) ||
        String(job.description || '').toLowerCase().includes(query) ||
        String(job.location || '').toLowerCase().includes(query)
      );
    }

    // Filter by wage range
    filtered = filtered.filter(job => {
      const wageNum = parseInt(String(job.wage || '').replace(/[^0-9]/g, '') || '0');
      return wageNum >= budgetRange[0] && wageNum <= budgetRange[1];
    });

    // Filter by distance if user location is available
    if (userLocation) {
      filtered = filtered.map(job => {
        if (job.latitude && job.longitude) {
          const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            job.latitude, job.longitude
          );
          return { ...job, distance: Math.round(distance * 10) / 10 };
        }
        return job;
      }).filter(job => !job.distance || job.distance <= distanceFilter);
    }

    // Sort logic
    switch (sortOption) {
      case 'wage_high': filtered.sort((a, b) => getWageNumber(b.wage) - getWageNumber(a.wage)); break;
      case 'wage_low':  filtered.sort((a, b) => getWageNumber(a.wage) - getWageNumber(b.wage)); break;
      case 'distance_near': if (userLocation) filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999)); break;
      case 'distance_far':  if (userLocation) filtered.sort((a, b) => (b.distance || 0) - (a.distance || 0)); break;
      case 'newest':    filtered.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)); break;
      default: break;
    }

    setJobs(filtered);
  };

  // Translate jobs when language or filtered job list changes
  useEffect(() => {
    const applyTranslation = async () => {
      if (jobs.length === 0) { setDisplayJobs([]); return; }
      const targetLang = language === 'te' ? 'telugu' : 'english';
      const titleTexts = jobs.map(j => j.title || '');
      const descTexts = jobs.map(j => j.description || '');
      const [transTitle, transDesc] = await Promise.all([
        translate(titleTexts, targetLang),
        translate(descTexts, targetLang)
      ]);
      setDisplayJobs(jobs.map((j, i) => ({
        ...j,
        _displayTitle: transTitle[i] || j.title,
        _displayDesc: transDesc[i] || j.description
      })));
    };
    applyTranslation();
  }, [jobs, language]); // eslint-disable-line

  // Haversine formula for distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error(language === 'en' ? 'Geolocation not supported' : 'జియోలొకేషన్ మద్దతు లేదు');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success(language === 'en' ? 'Location updated!' : 'స్థానం అప్‌డేట్ చేయబడింది!');
        setGettingLocation(false);
      },
      (error) => {
        toast.error(language === 'en' ? 'Failed to get location' : 'స్థానం పొందడంలో విఫలమైంది');
        setGettingLocation(false);
      }
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setBudgetRange([0, 10000]);
    setDistanceFilter(100);
    setUserLocation(null);
    setJobs(allJobs);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">{t('back')}</span>
          </button>
          
          <h1 className="font-bold text-lg text-slate-800">{t('findGig')}</h1>
          
          <button
            onClick={toggleLanguage}
            data-testid="findgig-language-toggle"
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium text-sm shrink-0"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="job-search-input"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              placeholder={t('searchJobs')}
            />
          </div>

          {/* Filter Buttons & Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="h-10 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer font-medium text-slate-700 min-w-[140px]"
              >
                <option value="newest">{language === 'en' ? 'Newest First' : 'కొత్తవి మొదట'}</option>
                <option value="wage_high">{language === 'en' ? 'Wage: High → Low' : 'వేతనం: ఎక్కువ → తక్కువ'}</option>
                <option value="wage_low">{language === 'en' ? 'Wage: Low → High' : 'వేతనం: తక్కువ → ఎక్కువ'}</option>
                {userLocation && (
                  <>
                    <option value="distance_near">{language === 'en' ? 'Distance: Near → Far' : 'దూరం: దగ్గర → దూరం'}</option>
                    <option value="distance_far">{language === 'en' ? 'Distance: Far → Near' : 'దూరం: దూరం → దగ్గర'}</option>
                  </>
                )}
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              data-testid="toggle-filters-btn"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                showFilters ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t('filter')}
            </button>
            
            <button
              onClick={getLocation}
              disabled={gettingLocation}
              data-testid="get-location-btn"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                userLocation ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Navigation className="w-4 h-4" />
              {gettingLocation ? '...' : (userLocation ? (language === 'en' ? 'Located' : 'గుర్తించబడింది') : (language === 'en' ? 'Use Location' : 'లొకేషన్ ఉపయోగించండి'))}
            </button>

            {(searchQuery || userLocation || budgetRange[0] > 0 || budgetRange[1] < 10000) && (
              <button
                onClick={clearFilters}
                data-testid="clear-filters-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4" />
                {language === 'en' ? 'Clear' : 'క్లియర్'}
              </button>
            )}

            <span className="text-sm text-slate-500 ml-auto">
              {jobs.length} {language === 'en' ? 'jobs found' : 'ఉద్యోగాలు కనుగొనబడ్డాయి'}
            </span>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 rounded-2xl p-4 space-y-6"
            >
              {/* Budget Range */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  {t('budgetRange')}: ₹{budgetRange[0]} - ₹{budgetRange[1]}
                </label>
                <Slider
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                  min={0}
                  max={10000}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Distance Filter */}
              {userLocation && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {t('distance')}: {distanceFilter} {t('km')}
                  </label>
                  <Slider
                    value={[distanceFilter]}
                    onValueChange={([value]) => setDistanceFilter(value)}
                    min={1}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              <button
                onClick={() => setShowFilters(false)}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
              >
                {t('apply')}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Job List */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
          {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">{t('noJobsFound')}</p>
          </div>
        ) : (
          <>
            {translating && (
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-3 bg-blue-50 rounded-xl px-3 py-2">
                <Languages className="w-4 h-4 animate-pulse" />
                {language === 'te' ? 'అనువదిస్తోంది...' : 'Translating...'}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/job/${job.id}`)}
                data-testid={`job-card-${job.id}`}
                className="bg-white rounded-3xl p-5 border-2 border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
              >
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                  {job._displayTitle || job.title}
                </h3>
                
                <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                  {job._displayDesc || job.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <IndianRupee className="w-4 h-4" />
                    <span className="font-semibold">{job.wage}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="text-sm truncate">{job.location}</span>
                    {job.distance && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full shrink-0">
                        {job.distance} {t('km')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{job.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{job.createdByName}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full h-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-semibold transition-colors"
                >
                  {t('viewDetails')}
                </button>
              </motion.div>
            ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FindGigPage;
