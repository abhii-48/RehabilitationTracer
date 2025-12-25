import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Users, Calendar, Activity, User, Settings, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const DoctorSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 h-screen fixed left-0 top-0 border-r border-gray-100 dark:border-slate-800 flex flex-col z-50">
            <div className="p-6">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <Activity size={20} />
                    </div>
                    Doctor Portal
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4">
                <button
                    onClick={() => navigate('/dashboard/doctor/requests')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors
                        ${isActive('/dashboard/doctor/requests') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Users size={18} />
                    Patient Requests
                </button>

                <button
                    onClick={() => navigate('/dashboard/doctor')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors
                        ${isActive('/dashboard/doctor') || location.pathname.startsWith('/dashboard/doctor/patient') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Activity size={18} />
                    Ongoing Programs
                </button>

                <button
                    onClick={() => navigate('/dashboard/doctor/history')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors
                        ${isActive('/dashboard/doctor/history') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Clock size={18} />
                    History
                </button>

                <div className="pt-4 mt-4 border-t border-gray-50 dark:border-slate-800">
                    <button
                        onClick={() => navigate('/dashboard/doctor/settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors
                        ${isActive('/dashboard/doctor/settings') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Settings size={18} />
                        Settings
                    </button>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors">
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </aside>
    );
};

const DoctorNavbar = () => {
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });

                // Update local storage and state for reliability
                localStorage.setItem('user', JSON.stringify(res.data));
                setDoctor(res.data);
            } catch (err) {
                console.error("Failed to fetch user profile", err);
                // Fallback to local storage if API fails
                const userStr = localStorage.getItem('user');
                if (userStr) setDoctor(JSON.parse(userStr));
            }
        };
        fetchUser();
    }, []);

    if (!doctor) return null;

    return (
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-8 py-4 mb-6 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Welcome Back, Dr. {doctor.lastName}
                    </h1>

                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold">
                        {doctor.firstName[0]}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DoctorDashboardLayout = () => {
    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0f172a] overflow-hidden flex">
            <DoctorSidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-64 relative h-screen overflow-y-auto">
                <DoctorNavbar />
                <main className="p-8 pt-2">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DoctorDashboardLayout;
