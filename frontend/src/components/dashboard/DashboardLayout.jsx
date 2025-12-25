import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ConnectDoctorModal from './patient/ConnectDoctorModal';
import NotificationCenter from './NotificationCenter';
import { useState, useEffect } from 'react';
import axios from 'axios';

const PatientNavbar = () => {
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });

                localStorage.setItem('user', JSON.stringify(res.data));
                setPatient(res.data);
            } catch (err) {
                console.error("Failed to fetch user profile", err);
                const userStr = localStorage.getItem('user');
                if (userStr) setPatient(JSON.parse(userStr));
            }
        };
        fetchUser();
    }, []);

    if (!patient) return null;

    return (
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-8 py-4 mb-6 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Welcome Back, {patient.firstName}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationCenter />
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold">
                        {patient.firstName[0]}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardLayout = () => {
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0f172a] overflow-hidden flex">
            <Sidebar onOpenConnectModal={() => setIsConnectModalOpen(true)} />

            {/* Main Content Area */}
            <div className="flex-1 ml-64 relative h-screen overflow-y-auto">
                <PatientNavbar />

                <main className="px-8 pb-8">
                    <Outlet />
                </main>
            </div>

            <ConnectDoctorModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
            />
        </div>
    );
};

export default DashboardLayout;
