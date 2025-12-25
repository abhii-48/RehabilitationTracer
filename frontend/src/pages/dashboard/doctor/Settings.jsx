import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Bell, Clock, Lock, Shield, Activity, Save, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DoctorSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);

    // States
    const [availability, setAvailability] = useState('Available');

    const [notifications, setNotifications] = useState({
        newRequests: true,
        patientUpdates: true,
        taskCompletions: true,
        programCompletion: true
    });

    const [programDefaults, setProgramDefaults] = useState({
        frequencyHours: 24,
        resetIntervalHours: 24,
        painThreshold: 7
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);

            if (res.data.availabilityStatus) setAvailability(res.data.availabilityStatus);
            if (res.data.settings?.notifications) setNotifications(prev => ({ ...prev, ...res.data.settings.notifications }));
            if (res.data.settings?.programDefaults) setProgramDefaults(prev => ({ ...prev, ...res.data.settings.programDefaults }));

            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings");
            setLoading(false);
        }
    };

    const handleUpdate = async (payloadKey, payloadData) => {
        try {
            const token = localStorage.getItem('token');
            const url = payloadKey === 'availabilityStatus'
                ? 'http://localhost:5000/api/auth/profile'
                : 'http://localhost:5000/api/auth/settings';

            // Construct body
            let body = {};
            if (payloadKey === 'availabilityStatus') {
                body = { availabilityStatus: payloadData };
            } else {
                body = { [payloadKey]: payloadData };
            }

            await axios.put(url, body, {
                headers: { 'x-auth-token': token }
            });
            // Toast mainly for manual saves, toggles are silent success usually
            if (payloadKey === 'programDefaults' || payloadKey === 'availabilityStatus') {
                toast.success("Settings Saved");
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleToggle = (key) => {
        const newVal = !notifications[key];
        setNotifications(prev => ({ ...prev, [key]: newVal }));
        handleUpdate('notifications', { [key]: newVal });
    };

    const handleDeactivate = async () => {
        if (!window.confirm("This will prevent new patient connections but preserve your history. Continue?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/auth/account', {
                headers: { 'x-auth-token': token }
            });
            toast.success("Account Deactivated");
            navigate('/login');
            localStorage.clear();
        } catch (error) {
            toast.error("Deactivation failed");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Change Password Logic
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        email: '',
        currentPassword: '',
        newPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/change-password', passwordForm, {
                headers: { 'x-auth-token': token }
            });
            toast.success("Password Updated Successfully");
            setPasswordModalOpen(false);
            setPasswordForm({ email: '', currentPassword: '', newPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Password update failed");
        }
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-10 relative">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Doctor Settings</h1>
            <p className="text-gray-500 mb-8">Configure your practice and preferences</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    <TabButton id="profile" icon={User} label="Profile & Status" />
                    <TabButton id="notifications" icon={Bell} label="Notifications" />
                    <TabButton id="defaults" icon={Clock} label="Program Defaults" />
                    <TabButton id="security" icon={Shield} label="Security" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm"
                    >
                        {/* PROFILE & STATS */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <User className="text-indigo-500" /> Doctor Profile
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                                    <div className="md:col-span-2 flex items-center gap-4 mb-2">
                                        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                            {user?.firstName?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dr. {user?.firstName} {user?.lastName}</h3>
                                            <p className="text-sm text-gray-500">{user?.domain}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Doctor ID</label>
                                        <p className="font-mono text-gray-800 dark:text-gray-200">{user?.doctorId}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Email</label>
                                        <p className="text-gray-800 dark:text-gray-200">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Availability Status</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Available', 'Busy', 'On Leave'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setAvailability(status);
                                                    handleUpdate('availabilityStatus', status);
                                                }}
                                                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${availability === status
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                    : 'border-gray-200 dark:border-slate-700 text-gray-500 hover:border-gray-300'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NOTIFICATIONS */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Bell className="text-indigo-500" /> Notification Preferences
                                </h2>

                                <div className="space-y-4">
                                    {[
                                        { id: 'newRequests', label: 'New Patient Requests', desc: 'Notify when a patient requests connection.' },
                                        { id: 'patientUpdates', label: 'Patient Pain Updates', desc: 'Alert when a patient logs a new pain level.' },
                                        { id: 'taskCompletions', label: 'Task Completions', desc: 'Notify when assigned tasks are completed.' },
                                        { id: 'programCompletion', label: 'Program Completion', desc: 'Alert when a full recovery plan ends.' }
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{item.label}</h3>
                                                <p className="text-sm text-gray-500">{item.desc}</p>
                                            </div>
                                            <div
                                                onClick={() => handleToggle(item.id)}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${notifications[item.id] ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${notifications[item.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PROGRAM DEFAULTS */}
                        {activeTab === 'defaults' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Clock className="text-indigo-500" /> Program Defaults
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Task Frequency (Hours)</label>
                                        <input
                                            type="number"
                                            value={programDefaults.frequencyHours}
                                            onChange={e => setProgramDefaults({ ...programDefaults, frequencyHours: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Reset Interval (Hours)</label>
                                        <input
                                            type="number"
                                            value={programDefaults.resetIntervalHours}
                                            onChange={e => setProgramDefaults({ ...programDefaults, resetIntervalHours: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pain Threshold Alert Level (1-10)</label>
                                        <input
                                            type="number"
                                            max="10"
                                            min="1"
                                            value={programDefaults.painThreshold}
                                            onChange={e => setProgramDefaults({ ...programDefaults, painThreshold: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => handleUpdate('programDefaults', programDefaults)}
                                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                                        >
                                            <Save size={18} /> Save Defaults
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECURITY */}
                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Shield className="text-indigo-500" /> Security
                                </h2>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => setPasswordModalOpen(true)}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Change Password</span>
                                        <span className="text-indigo-600 text-sm font-bold">Update</span>
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Log Out</span>
                                        <LogOut size={18} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
                                    <h3 className="text-orange-600 font-bold mb-2 flex items-center gap-2">
                                        <Activity size={18} /> Account Status
                                    </h3>
                                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-6 rounded-2xl">
                                        <h4 className="font-bold text-orange-800 dark:text-orange-400">Deactivate Account</h4>
                                        <p className="text-sm text-orange-600/80 mt-1 mb-4">
                                            This will set your status to inactive and prevent new patient requests. Your existing history and connections will be preserved.
                                        </p>
                                        <button
                                            onClick={handleDeactivate}
                                            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                                        >
                                            <Lock size={16} /> Deactivate Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* PASSWORD CHANGE MODAL */}
            {passwordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                    >
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={passwordForm.email}
                                    onChange={e => setPasswordForm({ ...passwordForm, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800"
                                    placeholder="Confirm your email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Existing Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setPasswordModalOpen(false)}
                                    className="flex-1 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DoctorSettings;
