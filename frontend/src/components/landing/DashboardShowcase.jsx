import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const DashboardShowcase = () => {
    return (
        <div className="py-24 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                {/* Patient Dashboard Preview */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full"
                    >
                        {/* Abstract UI Mockup */}
                        <div className="rounded-2xl bg-gray-900 dark:bg-slate-950 p-4 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500 border border-gray-800 dark:border-slate-800">
                            <div className="bg-gray-800 dark:bg-slate-900 rounded-xl overflow-hidden aspect-video border border-gray-700 dark:border-slate-800 relative">
                                <div className="group relative w-full h-full">
                                    <img
                                        src="/assets/patient-dashboard.png"
                                        alt="Patient Dashboard"
                                        className="w-full h-full object-cover blur-[2px] group-hover:blur-0 transition-all duration-500 scale-105 group-hover:scale-100"
                                    />
                                    {/* Overlay Label */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors duration-300">
                                        <span className="bg-black/50 backdrop-blur-md text-white px-6 py-2 rounded-full border border-white/20 font-bold opacity-100 group-hover:opacity-0 transition-opacity duration-300 transform translate-y-0 group-hover:translate-y-4">
                                            Patient View
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1"
                    >
                        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">For Patients</h3>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Take Control of Your Recovery</h2>
                        <ul className="space-y-4">
                            {[
                                'Daily Task Lists & Reminders',
                                'Real-time Vitals Logging',
                                'Visual Progress Charts',
                                'Direct Messaging with Doctor',
                                'Gamified Milestones'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Doctor Dashboard Preview */}
                <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full"
                    >
                        {/* Abstract UI Mockup */}
                        <div className="rounded-2xl bg-gray-900 dark:bg-slate-950 p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-gray-800 dark:border-slate-800">
                            <div className="bg-gray-800 dark:bg-slate-900 rounded-xl overflow-hidden aspect-video border border-gray-700 dark:border-slate-800 relative">
                                <div className="group relative w-full h-full">
                                    <img
                                        src="/assets/doctor-dashboard.png"
                                        alt="Doctor Dashboard"
                                        className="w-full h-full object-cover blur-[2px] group-hover:blur-0 transition-all duration-500 scale-105 group-hover:scale-100"
                                    />
                                    {/* Overlay Label */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors duration-300">
                                        <span className="bg-black/50 backdrop-blur-md text-white px-6 py-2 rounded-full border border-white/20 font-bold opacity-100 group-hover:opacity-0 transition-opacity duration-300 transform translate-y-0 group-hover:translate-y-4">
                                            Doctor View
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1"
                    >
                        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">For Doctors</h3>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Manage Multiple Patients Efficiently</h2>
                        <ul className="space-y-4">
                            {[
                                'Aggregate Patient Usage Stats',
                                'Real-time Alert System for Anomalies',
                                'Digital Prescription Management',
                                'Secure Patient Records',
                                'Customizable Recovery Plans'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default DashboardShowcase;
