import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut, Trash2, Save, Activity, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PatientSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // profile, notifications, privacy, account
    const [user, setUser] = useState(null);

    // Form States
    const [profileForm, setProfileForm] = useState({
        age: '',
        gender: '',
        height: '',
        weight: ''
    });

    const [notifications, setNotifications] = useState({
        dailyCheckIn: true,
        taskReminders: true,
        programUpdates: true
    });

    const [privacy, setPrivacy] = useState({
        allowDoctorViewFiles: true,
        allowDoctorViewHistory: true
    });

    // Fetch Settings
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

            // Populate States
            setProfileForm({
                age: res.data.age || '',
                gender: res.data.gender || '',
                height: res.data.height || '',
                weight: res.data.weight || ''
            });

            if (res.data.settings?.notifications) {
                setNotifications(prev => ({ ...prev, ...res.data.settings.notifications }));
            }
            if (res.data.settings?.privacy) {
                setPrivacy(prev => ({ ...prev, ...res.data.settings.privacy }));
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings");
            setLoading(false);
        }
    };

    // Update Handlers
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/profile', profileForm, {
                headers: { 'x-auth-token': token }
            });
            toast.success("Profile Updated");
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleToggle = async (type, key) => {
        const token = localStorage.getItem('token');
        let payload = {};

        if (type === 'notifications') {
            const newVal = !notifications[key];
            setNotifications(prev => ({ ...prev, [key]: newVal }));
            payload = { notifications: { [key]: newVal } };
        } else if (type === 'privacy') {
            const newVal = !privacy[key];
            setPrivacy(prev => ({ ...prev, [key]: newVal }));
            payload = { privacy: { [key]: newVal } };
        }

        try {
            await axios.put('http://localhost:5000/api/auth/settings', payload, {
                headers: { 'x-auth-token': token }
            });
            // toast.success("Saved");
        } catch (error) {
            toast.error("Failed to save setting");
            // Revert on error? For now simple toggle.
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure? This will permanently delete your account and all data. This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/auth/account', {
                headers: { 'x-auth-token': token }
            });
            localStorage.clear();
            navigate('/login');
            toast.success("Account Deleted");
        } catch (error) {
            toast.error("Failed to delete account");
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

    // UI Components
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-10 relative">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-500 mb-8">Manage your profile and preferences</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-2">
                    <TabButton id="profile" icon={User} label="Profile" />
                    <TabButton id="notifications" icon={Bell} label="Notifications" />
                    <TabButton id="privacy" icon={Shield} label="Privacy" />
                    <TabButton id="account" icon={Lock} label="Account" />
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm"
                    >
                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <User className="text-indigo-500" /> Personal Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name (Read-Only)</label>
                                        <input
                                            value={`${user?.firstName} ${user?.lastName}`}
                                            disabled
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Email (Read-Only)</label>
                                        <input
                                            value={user?.email}
                                            disabled
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none text-gray-500 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                                        <input
                                            type="number"
                                            value={profileForm.age}
                                            onChange={e => setProfileForm({ ...profileForm, age: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                        <select
                                            value={profileForm.gender}
                                            onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-binary">Non-binary</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 5'10"
                                            value={profileForm.height}
                                            onChange={e => setProfileForm({ ...profileForm, height: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 75kg"
                                            value={profileForm.weight}
                                            onChange={e => setProfileForm({ ...profileForm, weight: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Bell className="text-indigo-500" /> Notification Preferences
                                </h2>

                                <div className="space-y-4">
                                    {[
                                        { id: 'dailyCheckIn', label: 'Daily Pain Check-in Reminders', desc: 'Get reminded every morning to log your pain level.' },
                                        { id: 'taskReminders', label: 'Task Reminders', desc: 'Receive alerts when you have pending exercises.' },
                                        { id: 'programUpdates', label: 'Program Updates', desc: 'Get notified when your doctor updates your plan.' }
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{item.label}</h3>
                                                <p className="text-sm text-gray-500">{item.desc}</p>
                                            </div>
                                            <div
                                                onClick={() => handleToggle('notifications', item.id)}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${notifications[item.id] ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${notifications[item.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PRIVACY TAB */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Shield className="text-indigo-500" /> Privacy Controls
                                </h2>

                                <div className="space-y-4">
                                    {[
                                        { id: 'allowDoctorViewFiles', label: 'Allow Doctor to view uploaded files', desc: 'Grant access to your X-rays and MRI scans.' },
                                        { id: 'allowDoctorViewHistory', label: 'Allow Doctor to view pain history', desc: 'Let your doctor see your historical progress charts.' }
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{item.label}</h3>
                                                <p className="text-sm text-gray-500">{item.desc}</p>
                                            </div>
                                            <div
                                                onClick={() => handleToggle('privacy', item.id)}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${privacy[item.id] ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${privacy[item.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ACCOUNT TAB */}
                        {activeTab === 'account' && (
                            <div className="space-y-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Lock className="text-indigo-500" /> Account Actions
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
                                    <h3 className="text-red-600 font-bold mb-2 flex items-center gap-2">
                                        <Activity size={18} /> Danger Zone
                                    </h3>
                                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl">
                                        <h4 className="font-bold text-red-800 dark:text-red-400">Delete Account</h4>
                                        <p className="text-sm text-red-600/80 mt-1 mb-4">
                                            Once you delete your account, there is no going back. All your connected doctors, messages, and history will be permanently removed.
                                        </p>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={16} /> Delete My Account
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

export default PatientSettings;
