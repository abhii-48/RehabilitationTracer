import { motion } from 'framer-motion';
import { CalendarCheck, UserCheck, TrendingUp, Clock } from 'lucide-react';

const features = [
    {
        name: 'Smart Scheduling',
        description: 'Keep your rehabilitation on track with intelligent task scheduling and daily reminders that adapt to your progress.',
        icon: CalendarCheck,
    },
    {
        name: 'Doctor Connection',
        description: 'Seamlessly share your progress with your medical team. Get adjustments to your plan in real-time without office visits.',
        icon: UserCheck,
    },
    {
        name: 'Visual Progress',
        description: 'See your improvement over time with beautiful, easy-to-understand charts and recovery milestones.',
        icon: TrendingUp,
    },
    {
        name: '24/7 Monitoring',
        description: 'Log vitals and symptoms anytime. Our system alerts you and your doctor if anything looks off.',
        icon: Clock,
    },
];

const About = () => {
    return (
        <div id="about" className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide"
                    >
                        Why Choose RehabTracer?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
                    >
                        Everything you need to recover faster
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400"
                    >
                        RehabTracer bridges the gap between clinical visits and daily life, ensuring you stay motivated and your doctor stays informed.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                {feature.name}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
