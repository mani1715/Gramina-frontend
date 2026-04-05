import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalChatWidget from "./components/GlobalChatWidget";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import Dashboard from "./pages/Dashboard";
import FindGigPage from "./pages/FindGigPage";
import JobDetailPage from "./pages/JobDetailPage";
import GiveGigPage from "./pages/GiveGigPage";
import AppliedGigsPage from "./pages/AppliedGigsPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/find-gig" element={
                <ProtectedRoute>
                  <FindGigPage />
                </ProtectedRoute>
              } />
              <Route path="/job/:jobId" element={
                <ProtectedRoute>
                  <JobDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/give-gig" element={
                <ProtectedRoute>
                  <GiveGigPage />
                </ProtectedRoute>
              } />
              <Route path="/applied-gigs" element={
                <ProtectedRoute>
                  <AppliedGigsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
            </Routes>
            <GlobalChatWidget />
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
