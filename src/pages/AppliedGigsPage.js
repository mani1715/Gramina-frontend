import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Globe, 
  Briefcase,
  ClipboardList,
  MapPin,
  IndianRupee,
  Calendar,
  Clock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AppliedGigsPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsResponse, jobsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/my-applications`, { withCredentials: true }),
        axios.get(`${API_URL}/api/my-jobs`, { withCredentials: true })
      ]);
      setApplications(appsResponse.data);
      setMyJobs(jobsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

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
          
          <h1 className="font-bold text-lg text-slate-800">{t('appliedGigs')}</h1>
          
          <button
            onClick={toggleLanguage}
            data-testid="appliedgigs-language-toggle"
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium text-sm"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="applied" className="w-full">
            <TabsList className="w-full h-14 bg-white rounded-2xl p-1 mb-6">
              <TabsTrigger 
                value="applied" 
                data-testid="tab-applied"
                className="flex-1 h-12 rounded-xl font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <ClipboardList className="w-5 h-5 mr-2" />
                {t('appliedGigs')}
              </TabsTrigger>
              <TabsTrigger 
                value="posted" 
                data-testid="tab-posted"
                className="flex-1 h-12 rounded-xl font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                {t('postedGigs')}
              </TabsTrigger>
            </TabsList>

            {/* Applied Jobs Tab */}
            <TabsContent value="applied">
              {applications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                  <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">{language === 'en' ? 'No applications yet' : 'ఇంకా దరఖాస్తులు లేవు'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-3xl p-5 border border-slate-100"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-2">{app.jobTitle}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(app.status)}`}>
                              {app.status === 'pending' ? (language === 'en' ? 'Pending' : 'పెండింగ్') : 
                               app.status === 'accepted' ? (language === 'en' ? 'Accepted' : 'ఆమోదించబడింది') : 
                               (language === 'en' ? 'Rejected' : 'తిరస్కరించబడింది')}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-4 h-4" />
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Posted Jobs Tab */}
            <TabsContent value="posted">
              {myJobs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                  <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">{language === 'en' ? 'No jobs posted yet' : 'ఇంకా ఉద్యోగాలు పోస్ట్ చేయలేదు'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate('/give-gig')}
                      className="bg-white rounded-3xl p-5 border border-slate-100 cursor-pointer hover:border-emerald-200 transition-colors"
                    >
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          {job.wage}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {job.date}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {job.applicantCount} {language === 'en' ? 'applicants' : 'దరఖాస్తుదారులు'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default AppliedGigsPage;
