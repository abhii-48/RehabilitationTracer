import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Contact from './Contact';
import DashboardLayout from './components/dashboard/DashboardLayout';
import MyRecovery from './components/dashboard/patient/MyRecovery';
import History from './components/dashboard/patient/History';
import ProgramDashboard from './pages/dashboard/ProgramDashboard';
import DoctorDashboardLayout from './components/dashboard/DoctorDashboardLayout';
import DoctorHome from './pages/dashboard/doctor/DoctorHome';
import DoctorHistory from './pages/dashboard/doctor/DoctorHistory';
import DoctorPatientRequests from './pages/dashboard/doctor/DoctorPatientRequests';
import PatientWorkspace from './pages/dashboard/doctor/PatientWorkspace';
import PatientSettings from './pages/dashboard/patient/Settings';
import DoctorSettings from './pages/dashboard/doctor/Settings';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard/patient" element={<DashboardLayout />}>
              <Route index element={<MyRecovery />} />
              <Route path="history" element={<History />} />
              <Route path="program/:id" element={<ProgramDashboard />} />
              <Route path="settings" element={<PatientSettings />} />
            </Route>

            {/* Doctor Dashboard Routes */}
            <Route path="/dashboard/doctor" element={<DoctorDashboardLayout />}>
              <Route index element={<DoctorHome />} />
              <Route path="requests" element={<DoctorPatientRequests />} />
              <Route path="history" element={<DoctorHistory />} />
              <Route path="patient/:id" element={<PatientWorkspace />} />
              <Route path="settings" element={<DoctorSettings />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </SocketProvider>
  );
}

export default App;
