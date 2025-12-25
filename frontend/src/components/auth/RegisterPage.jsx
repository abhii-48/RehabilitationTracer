import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Stethoscope, ArrowRight, Dna, Lock, Mail, Hash, AlertCircle } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        patientId: '',
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

    const generatePatientId = () => {
        // Generate RT-P-XXXXXX
        const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random
        setFormData(prev => ({ ...prev, patientId: `RT-P-${randomNum}` }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role })
            });

            const data = await response.json();

            if (!response.ok) {
                // Check if it's a "User already exists" error and format clearly
                if (data.msg && data.msg.includes('already exists')) {
                    throw new Error(`Registration Failed: ${data.msg}. Please use different credentials.`);
                }
                throw new Error(data.msg || (data.errors ? data.errors[0].msg : 'Registration failed'));
            }

            // Success - Navigate to login with role pre-selected
            navigate('/login', { state: { role: role } });
        } catch (err) {
            setError(err.message);
        }
    };

    // Reset fields when role changes to avoid confusion
    useEffect(() => {
        setError('');
    }, [role]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Join RehabTracer and start your journey.
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
                                    className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center gap-2 text-sm"
                                >
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Common Fields: Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Role Specific Fields */}
                        <AnimatePresence mode='wait'>
                            {role === 'patient' ? (
                                <motion.div
                                    key="patient-fields"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Patient ID
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                name="patientId"
                                                readOnly
                                                placeholder="Generate your unique ID"
                                                value={formData.patientId}
                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-600 text-gray-500 dark:text-gray-300 sm:text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={generatePatientId}
                                                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-slate-600 rounded-r-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium text-sm transition-colors"
                                            >
                                                Generate ID
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Click generate to get your unique recovery tracking ID.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="doctor-fields"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor ID</label>
                                            <input
                                                name="doctorId"
                                                type="text"
                                                required
                                                placeholder="Unique ID provided by admin"
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
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email */}
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
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                                        placeholder="Enter password"
                                    />
                                </div>
                                {/* Strength Meter */}
                                <PasswordStrengthMeter password={formData.password} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                                        placeholder="Confirm password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
                            >
                                Register Account <ArrowRight size={18} className="ml-2" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
