import { motion } from 'framer-motion';
import { UserPlus, Calendar, Activity, CheckCircle } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: 'Sign Up & Profile',
        description: 'Create your account and set up your rehabilitation profile with your doctor\'s prescription details.',
        icon: UserPlus,
    },
    {
        id: 2,
        title: 'Daily Plan & Tasks',
        description: 'Receive your personalized daily recovery tasks and exercise schedules directly on your dashboard.',
        icon: Calendar,
    },
    {
        id: 3,
        title: 'Track & Log',
        description: 'Log your vitals, pain levels, and exercise completion. Your data is visualized instantly.',
        icon: Activity,
    },
    {
        id: 4,
        title: 'Doctor Review',
        description: 'Your doctor reviews your progress in real-time and adjusts your recovery plan as needed.',
        icon: CheckCircle,
    },
];

const HowItWorks = () => {
    return (
        <div id="how-it-works" className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
                    >
                        How RehabTracer Works
                    </motion.h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        A simple, guided path to your full recovery.
                    </p>
                </div>

                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-700 -translate-y-1/2 z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-lg relative group hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto md:mx-0 relative z-10 ring-4 ring-white dark:ring-slate-800">
                                    {step.id}
                                </div>
                                <div className="absolute top-6 right-6 text-indigo-100 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    <step.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
