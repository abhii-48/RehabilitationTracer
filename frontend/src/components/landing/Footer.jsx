import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { Activity, Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
import { useState } from 'react';
import LegalModal from './LegalModal';

const Footer = () => {
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);

    const privacyContent = (
        <div className="space-y-4">
            <h4 className="font-bold">1. Data Collection</h4>
            <p>We collect personal information including health vitals, recovery progress data, and contact details to provide our rehabilitation services.</p>
            <h4 className="font-bold">2. Data Usage</h4>
            <p>Your data is used solely for tracking your recovery and sharing insights with your assigned medical professionals.</p>
            <h4 className="font-bold">3. Security</h4>
            <p>We use industry-standard encryption to protect your medical data (HIPAA compliant).</p>
            <p>By accepting this policy, you agree to our data handling practices.</p>
            <p className="text-sm text-gray-400 mt-8">Last Updated: December 2025</p>
        </div>
    );

    const termsContent = (
        <div className="space-y-4">
            <h4 className="font-bold">1. Acceptance of Terms</h4>
            <p>By accessing RehabTracer, you agree to be bound by these Terms of Service.</p>
            <h4 className="font-bold">2. Medical Disclaimer</h4>
            <p>RehabTracer is a tracking tool, not a substitute for professional medical advice. Always consult your doctor.</p>
            <h4 className="font-bold">3. User Responsibilities</h4>
            <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
            <p className="text-sm text-gray-400 mt-8">Last Updated: December 2025</p>
        </div>
    );

    return (
        <footer className="bg-gray-900 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
                            <div className="bg-indigo-600 p-2 rounded-lg text-white group-hover:bg-indigo-500 transition-colors">
                                <Activity size={24} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">
                                Rehab<span className="text-indigo-500">Tracer</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                            Seamlessly connecting patients and doctors for effective rehabilitation.
                            Track progress, visualize recovery, and stay motivated every step of the way.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Instagram, Linkedin, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links 1 - Platform */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <li>
                                <ScrollLink to="about" smooth={true} duration={500} offset={-80} className="text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer">
                                    Features
                                </ScrollLink>
                            </li>
                            <li>
                                <ScrollLink to="how-it-works" smooth={true} duration={500} offset={-80} className="text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer">
                                    How It Works
                                </ScrollLink>
                            </li>
                            <li>
                                <ScrollLink to="testimonials" smooth={true} duration={500} offset={-80} className="text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer">
                                    Testimonials
                                </ScrollLink>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-indigo-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support / Legal */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Support</h4>
                        <ul className="space-y-4">
                            {/* Removed Help Center */}
                            <li>
                                <button onClick={() => setPrivacyOpen(true)} className="text-gray-400 hover:text-indigo-400 transition-colors text-left">
                                    Privacy Policy
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setTermsOpen(true)} className="text-gray-400 hover:text-indigo-400 transition-colors text-left">
                                    Terms of Service
                                </button>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">© 2025 RehabTracer. All rights reserved.</p>
                    <p className="text-gray-600 text-sm">Rehabilitation & Recovery Progress Tracking Platform</p>
                </div>
            </div>

            {/* Modals */}
            <LegalModal
                isOpen={privacyOpen}
                onClose={() => setPrivacyOpen(false)}
                title="Privacy Policy"
                content={privacyContent}
            />
            <LegalModal
                isOpen={termsOpen}
                onClose={() => setTermsOpen(false)}
                title="Terms of Service"
                content={termsContent}
            />
        </footer>
    );
};

export default Footer;
