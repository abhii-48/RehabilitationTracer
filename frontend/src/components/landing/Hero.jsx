import { motion } from 'framer-motion';
import { ArrowRight, Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div id="home" className="relative pt-24 pb-12 lg:pt-32 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-purple-200/50 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-50 animate-blob" />
            <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-200/50 dark:bg-purple-900/30 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-sm font-semibold shadow-sm backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Next-Gen Rehabilitation Tracking
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6"
                >
                    Your Journey to Recovery, <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 animate-gradient bg-300%">
                        Visualized & Empowered.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed"
                >
                    Experience the future of rehabilitation with real-time progress tracking,
                    doctor connectivity, and personalized recovery insights.
                    Recover smarter, not harder.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all duration-300"
                    >
                        Start Your Journey <ArrowRight size={20} />
                    </Link>
                </motion.div>

                {/* Floating Feature Cards (Decorative) */}
                <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90">
                    {[
                        { icon: Activity, title: 'Real-time Tracking', text: 'Monitor every step of progress.', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/50' },
                        { icon: HeartPulse, title: 'Vitals Monitoring', text: 'Keep track of health stats easily.', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/50' },
                        { icon: ShieldCheck, title: 'Doctor Verified', text: 'Direct insights from your pro.', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/50' },
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 flex flex-col items-center text-center"
                        >
                            <div className={`p-4 rounded-2xl ${feature.bg} ${feature.color} mb-4`}>
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400">{feature.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hero;
