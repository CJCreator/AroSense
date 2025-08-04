import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import AuthLayout from './components/AuthLayout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { awardPointsForDailyLaunch } from './utils/gamificationUtils.ts'; 

// Static imports to resolve module loading issues
import Dashboard from './components/Dashboard.tsx';
import FamilyProfilesPage from './pages/FamilyProfilesPage.tsx';
import EmergencyInfoPage from './pages/EmergencyInfoPage.tsx';
import DocumentManagementPage from './pages/DocumentManagementPage.tsx';
import PrescriptionPage from './pages/PrescriptionPage.tsx';
import InsurancePage from './pages/InsurancePage.tsx';
import FinancialPage from './pages/FinancialPage.tsx';
import WellnessPage from './pages/WellnessPage.tsx';
import BabyCarePage from './pages/BabyCarePage.tsx';
import WomensCarePage from './pages/WomensCarePage.tsx';
import PregnancyPage from './pages/PregnancyPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import TelehealthPage from './pages/TelehealthPage.tsx';
import CommunityForumPage from './pages/CommunityForumPage.tsx';
import WellnessRewardsPage from './pages/WellnessRewardsPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';

const LoadingIndicator: React.FC = () => (
  <div className="flex justify-center items-center h-screen bg-background">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);


const AppContent: React.FC = () => {
  const auth = useAuth();

  React.useEffect(() => {
    // Award points for daily app launch if authenticated
    if (auth.isAuthenticated && auth.currentUser) {
      awardPointsForDailyLaunch(auth.currentUser.id);
    }
  }, [auth.isAuthenticated, auth.currentUser]);

  if (auth.isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Routes>
        {/* Routes for unauthenticated users (Login, Register) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes for authenticated users */}
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/family-profiles" element={<ProtectedRoute><FamilyProfilesPage /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><EmergencyInfoPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentManagementPage /></ProtectedRoute>} />
          <Route path="/prescriptions" element={<ProtectedRoute><PrescriptionPage /></ProtectedRoute>} />
          <Route path="/insurance" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
          <Route path="/financial" element={<ProtectedRoute><FinancialPage /></ProtectedRoute>} />
          <Route path="/wellness" element={<ProtectedRoute><WellnessPage /></ProtectedRoute>} />
          <Route path="/baby-care" element={<ProtectedRoute><BabyCarePage /></ProtectedRoute>} />
          <Route path="/womens-care" element={<ProtectedRoute><WomensCarePage /></ProtectedRoute>} />
          <Route path="/pregnancy" element={<ProtectedRoute><PregnancyPage /></ProtectedRoute>} />
          <Route path="/telehealth" element={<ProtectedRoute><TelehealthPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityForumPage /></ProtectedRoute>} />
          <Route path="/wellness-rewards" element={<ProtectedRoute><WellnessRewardsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;