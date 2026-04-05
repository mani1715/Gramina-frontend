import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Common
    appName: "GramaMitra",
    tagline: "Find Work. Give Work. Instantly.",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    next: "Next",
    submit: "Submit",
    search: "Search",
    filter: "Filter",
    apply: "Apply",
    close: "Close",
    
    // Landing Page
    heroTitle: "Find Work. Give Work.",
    heroSubtitle: "Connect with local jobs instantly. No middlemen.",
    findGig: "Find a Gig",
    giveGig: "Give a Gig",
    voiceFeature: "Voice Job Posting",
    voiceFeatureDesc: "Speak in Telugu or English to post jobs instantly",
    locationFeature: "Location-Based Jobs",
    locationFeatureDesc: "Find work near you with GPS matching",
    easyApply: "Easy Apply",
    easyApplyDesc: "Apply with just one tap - simple and fast",
    noMiddlemen: "No Middlemen",
    noMiddlemenDesc: "Connect directly with job providers",
    howItWorks: "How It Works",
    step1Title: "Speak or Search",
    step1Desc: "Tell us what work you need in your language",
    step2Title: "Connect Nearby",
    step2Desc: "Find jobs and workers close to you",
    step3Title: "Get Work Done",
    step3Desc: "Complete the job and get paid",
    
    // Auth
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    name: "Name",
    phone: "Phone Number",
    area: "Area / Village",
    verifyOTP: "Verify OTP",
    enterOTP: "Enter the 6-digit code sent to your email",
    resendOTP: "Resend OTP",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    
    // Dashboard
    dashboard: "Dashboard",
    home: "Home",
    profile: "Profile",
    about: "About",
    appliedGigs: "Applied Gigs",
    postedGigs: "Posted Gigs",
    
    // Find Gig
    searchJobs: "Search jobs...",
    budgetRange: "Budget Range",
    distance: "Distance",
    km: "km",
    noJobsFound: "No jobs found",
    viewDetails: "View Details",
    applyNow: "Apply Now",
    alreadyApplied: "Already Applied",
    perDay: "/day",
    
    // Give Gig
    addJob: "Add Job",
    jobTitle: "Job Title",
    jobDescription: "Job Description",
    wage: "Wage / Payment",
    location: "Location",
    date: "Date",
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    processing: "Processing...",
    selectLanguage: "Select Language",
    telugu: "Telugu",
    english: "English",
    speakNow: "Speak now...",
    voiceInstructions: "Tap the microphone and describe your job",
    
    // Job Management
    myJobs: "My Jobs",
    viewApplicants: "View Applicants",
    applicants: "Applicants",
    contact: "Contact",
    noApplicants: "No applicants yet",
    jobsPosted: "Jobs Posted",
    applicationsReceived: "Applications Received",
    
    // Profile
    editProfile: "Edit Profile",
    updateProfile: "Update Profile",
    profileUpdated: "Profile updated successfully",
    
    // About
    aboutTitle: "About GramaMitra",
    aboutDesc: "GramaMitra is a platform designed for rural communities to find and provide work opportunities. We believe in connecting people directly, without middlemen, making job hunting simple and accessible for everyone.",
    ourMission: "Our Mission",
    missionDesc: "To empower rural India with digital job connections, making work accessible to everyone regardless of literacy level.",
    
    // Footer
    footerAbout: "About",
    footerContact: "Contact",
    footerPrivacy: "Privacy",
    footerRights: "All rights reserved",
  },
  te: {
    // Common
    appName: "గ్రామ మిత్ర",
    tagline: "పని కనుగొనండి. పని ఇవ్వండి. వెంటనే.",
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
    success: "విజయవంతం",
    cancel: "రద్దు చేయండి",
    save: "సేవ్ చేయండి",
    edit: "మార్చండి",
    delete: "తొలగించండి",
    back: "వెనుకకు",
    next: "తదుపరి",
    submit: "సమర్పించండి",
    search: "వెతకండి",
    filter: "ఫిల్టర్",
    apply: "దరఖాస్తు చేయండి",
    close: "మూసివేయండి",
    
    // Landing Page
    heroTitle: "పని కనుగొనండి. పని ఇవ్వండి.",
    heroSubtitle: "స్థానిక ఉద్యోగాలతో వెంటనే కనెక్ట్ అవ్వండి. మధ్యవర్తులు లేరు.",
    findGig: "పని కనుగొనండి",
    giveGig: "పని ఇవ్వండి",
    voiceFeature: "వాయిస్ జాబ్ పోస్టింగ్",
    voiceFeatureDesc: "తెలుగు లేదా ఆంగ్లంలో మాట్లాడి వెంటనే ఉద్యోగాలు పోస్ట్ చేయండి",
    locationFeature: "లొకేషన్ ఆధారిత ఉద్యోగాలు",
    locationFeatureDesc: "GPS మ్యాచింగ్‌తో మీ సమీపంలో పని కనుగొనండి",
    easyApply: "సులభ దరఖాస్తు",
    easyApplyDesc: "ఒక్క ట్యాప్‌తో దరఖాస్తు చేయండి - సులభం మరియు వేగవంతం",
    noMiddlemen: "మధ్యవర్తులు లేరు",
    noMiddlemenDesc: "ఉద్యోగ ప్రదాతలతో నేరుగా కనెక్ట్ అవ్వండి",
    howItWorks: "ఇది ఎలా పనిచేస్తుంది",
    step1Title: "మాట్లాడండి లేదా వెతకండి",
    step1Desc: "మీకు ఏ పని కావాలో మీ భాషలో చెప్పండి",
    step2Title: "సమీపంలో కనెక్ట్ అవ్వండి",
    step2Desc: "మీకు దగ్గరలో ఉద్యోగాలు మరియు కార్మికులను కనుగొనండి",
    step3Title: "పని పూర్తి చేయండి",
    step3Desc: "పని పూర్తి చేసి చెల్లింపు పొందండి",
    
    // Auth
    login: "లాగిన్",
    signup: "సైన్ అప్",
    logout: "లాగ్ అవుట్",
    email: "ఇమెయిల్",
    password: "పాస్‌వర్డ్",
    confirmPassword: "పాస్‌వర్డ్ నిర్ధారించండి",
    name: "పేరు",
    phone: "ఫోన్ నంబర్",
    area: "ప్రాంతం / గ్రామం",
    verifyOTP: "OTP ధృవీకరించండి",
    enterOTP: "మీ ఇమెయిల్‌కు పంపిన 6-అంకె కోడ్ నమోదు చేయండి",
    resendOTP: "OTP మళ్ళీ పంపండి",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    noAccount: "అకౌంట్ లేదా?",
    haveAccount: "ఇప్పటికే అకౌంట్ ఉందా?",
    
    // Dashboard
    dashboard: "డాష్‌బోర్డ్",
    home: "హోమ్",
    profile: "ప్రొఫైల్",
    about: "గురించి",
    appliedGigs: "దరఖాస్తు చేసిన పనులు",
    postedGigs: "పోస్ట్ చేసిన పనులు",
    
    // Find Gig
    searchJobs: "ఉద్యోగాలు వెతకండి...",
    budgetRange: "బడ్జెట్ పరిధి",
    distance: "దూరం",
    km: "కి.మీ",
    noJobsFound: "ఉద్యోగాలు కనుగొనబడలేదు",
    viewDetails: "వివరాలు చూడండి",
    applyNow: "ఇప్పుడు దరఖాస్తు చేయండి",
    alreadyApplied: "ఇప్పటికే దరఖాస్తు చేసారు",
    perDay: "/రోజు",
    
    // Give Gig
    addJob: "ఉద్యోగం జోడించండి",
    jobTitle: "ఉద్యోగ శీర్షిక",
    jobDescription: "ఉద్యోగ వివరణ",
    wage: "వేతనం / చెల్లింపు",
    location: "స్థానం",
    date: "తేదీ",
    startRecording: "రికార్డింగ్ ప్రారంభించండి",
    stopRecording: "రికార్డింగ్ ఆపండి",
    processing: "ప్రాసెస్ అవుతోంది...",
    selectLanguage: "భాష ఎంచుకోండి",
    telugu: "తెలుగు",
    english: "ఆంగ్లం",
    speakNow: "ఇప్పుడు మాట్లాడండి...",
    voiceInstructions: "మైక్రోఫోన్ నొక్కి మీ ఉద్యోగాన్ని వివరించండి",
    
    // Job Management
    myJobs: "నా ఉద్యోగాలు",
    viewApplicants: "దరఖాస్తుదారులను చూడండి",
    applicants: "దరఖాస్తుదారులు",
    contact: "సంప్రదించండి",
    noApplicants: "ఇంకా దరఖాస్తుదారులు లేరు",
    jobsPosted: "పోస్ట్ చేసిన ఉద్యోగాలు",
    applicationsReceived: "అందుకున్న దరఖాస్తులు",
    
    // Profile
    editProfile: "ప్రొఫైల్ మార్చండి",
    updateProfile: "ప్రొఫైల్ అప్‌డేట్ చేయండి",
    profileUpdated: "ప్రొఫైల్ విజయవంతంగా అప్‌డేట్ చేయబడింది",
    
    // About
    aboutTitle: "గ్రామ మిత్ర గురించి",
    aboutDesc: "గ్రామ మిత్ర గ్రామీణ సమాజాల కోసం పని అవకాశాలు కనుగొనడానికి మరియు అందించడానికి రూపొందించబడిన వేదిక. మధ్యవర్తులు లేకుండా ప్రజలను నేరుగా కనెక్ట్ చేయడంలో, అందరికీ ఉద్యోగ వేట సులభం మరియు అందుబాటులో ఉంచడంలో మేము నమ్ముతున్నాము.",
    ourMission: "మా లక్ష్యం",
    missionDesc: "అక్షరాస్యత స్థాయితో సంబంధం లేకుండా ప్రతి ఒక్కరికీ పని అందుబాటులో ఉండేలా డిజిటల్ ఉద్యోగ కనెక్షన్లతో గ్రామీణ భారతదేశాన్ని శక్తివంతం చేయడం.",
    
    // Footer
    footerAbout: "గురించి",
    footerContact: "సంప్రదించండి",
    footerPrivacy: "గోప్యత",
    footerRights: "అన్ని హక్కులు రిజర్వు చేయబడ్డాయి",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gramamitra_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gramamitra_lang', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
