import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import Analysis from './pages/Analysis';
import Rewrite from './pages/Rewrite';
import CompanyMatch from './pages/CompanyMatch';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/upload" element={<UploadResume />} />
            <Route path="/dashboard/analysis" element={<Dashboard />} />
            <Route path="/dashboard/analysis/:resumeId" element={<Analysis />} />
            <Route path="/dashboard/rewrite" element={<Dashboard />} />
            <Route path="/dashboard/rewrite/:resumeId" element={<Rewrite />} />
            <Route path="/dashboard/company-match" element={<CompanyMatch />} />
            <Route path="/dashboard/company-match/:resumeId" element={<CompanyMatch />} />
            <Route path="/dashboard/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
