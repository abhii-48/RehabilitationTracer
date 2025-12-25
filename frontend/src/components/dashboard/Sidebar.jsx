import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity,
    LogOut,
    Stethoscope,
    Settings,
    HeartPulse,
    Clock // Icon for My Recovery
} from 'lucide-react';
import { motion } from 'framer-motion';

const NavItem = ({ icon: Icon, label, path, action }) => {
    const location = useLocation();
    const navigate = useNavigate();
    // Active if exact match or if it's the root matching the path (for My Recovery)
    const isActive = path && (location.pathname === path || (path === '/dashboard/patient' && location.pathname === '/dashboard/patient/'));

    return (
        <button
            onClick={() => action ? action() : navigate(path)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                    ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 hover:text-indigo-500'
                }`}
        >
            <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-500'} />
            <span className="text-sm">{label}</span>
            {isActive && (
                <motion.div layoutId="active-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
        </button>
    );
};

const Sidebar = ({ onOpenConnectModal }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 h-screen fixed left-0 top-0 border-r border-gray-100 dark:border-slate-800 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <Activity size={20} />
                    </div>
                    Patient Portal
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4">
                <NavItem icon={HeartPulse} label="My Recovery" path="/dashboard/patient" />
                <NavItem icon={Clock} label="History" path="/dashboard/patient/history" />
                <NavItem icon={Stethoscope} label="Find New Doctor" action={onOpenConnectModal} />
                <div className="pt-4 mt-4 border-t border-gray-50 dark:border-slate-800">
                    <NavItem icon={Settings} label="Settings" path="/dashboard/patient/settings" />
                </div>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
