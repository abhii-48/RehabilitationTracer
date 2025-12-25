import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Stethoscope, ArrowRight, Dna, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if role was passed from register page, default to 'patient'
    const initialRole = location.state?.role || 'patient';
    const [role, setRole] = useState(initialRole);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        doctorId: '',
        domain: ''
    });
    const [error, setError] = useState('');

    const domains = [
        'Physiotherapist', 'Orthopedic Specialist', 'Sports Injury Specialist',
        'Occupational Therapist', 'Neurologist (Rehabilitation)', 'Pain Management Specialist',
        'Rehabilitation Physician (PM&R)', 'Psychologist (Rehabilitation Support)', 'Geriatric Care Specialist'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // STRATEGY: 
            // 1. Google Login -> Supabase (handled by separate button/function usually, but if integrated here..)
            //    Actually, Google login is usually a separate button. This form is for Email/Pass.
            // 2. Email/Pass -> Node API (Standard)

            // NOTE: The user requested Supabase ONLY for Google. 
            // So for this form, we go straight to Node backend.

            const body = {
                email: formData.email,
                password: formData.password,
                role
            };

            // Add Doctor specifics if needed
            if (role === 'doctor') {
                body.doctorId = formData.doctorId;
                body.domain = formData.domain;
            }

            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || (data.errors ? data.errors[0].msg : 'Login failed'));
            }

            // Success - Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Notify SocketContext
            window.dispatchEvent(new Event('auth-change'));

            // Redirect
            navigate(role === 'patient' ? '/dashboard/patient' : '/dashboard/doctor');
        } catch (err) {
            setError(err.message);
        }
    };

    // Google Login Handler (Supabase)
    const handleGoogleLogin = async () => {
        try {
            // Note: This requires Supabase client import. 
            // Ensure supabase is imported if we add the button.
            // For now, focusing on fixing the Email/Pass flow as requested.
        } catch (error) {
            setError(error.message);
        }
    };

    // Reset fields when role changes
    useEffect(() => {
        setError('');
        setFormData({
            email: '',
            password: '',
            doctorId: '',
            domain: ''
        });
    }, [role]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative">
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
            >
                <ArrowLeft size={20} /> Back to Home
            </Link>
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-indigo-600 p-3 rounded-xl text-white">
                            <Dna size={40} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Welcome Back!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to monitor your rehabilitation process.
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex">
                        <button
                            onClick={() => setRole('patient')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${role === 'patient'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            <User size={18} /> Patient
                        </button>
                        <button
                            onClick={() => setRole('doctor')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${role === 'doctor'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            <Stethoscope size={18} /> Doctor
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100 dark:border-slate-700">
                    <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center gap-2 text-sm mb-4"
                                >
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Doctor Specific Fields */}
                        <AnimatePresence mode='wait'>
                            {role === 'doctor' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-6 overflow-hidden"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor ID</label>
                                        <input
                                            name="doctorId"
                                            type="text"
                                            required
                                            value={formData.doctorId}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Domain</label>
                                        <select
                                            name="domain"
                                            required
                                            value={formData.domain}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="">Select Domain</option>
                                            {domains.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Common Fields */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={16} className="text-gray-400" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="off"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={16} className="text-gray-400" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
                            >
                                Sign In <ArrowRight size={18} className="ml-2" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
