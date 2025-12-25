import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import HowItWorks from './HowItWorks';
import DashboardShowcase from './DashboardShowcase';
import Testimonials from './Testimonials';
import Footer from './Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
            <Navbar />
            <Hero />
            <About />
            <HowItWorks />
            <DashboardShowcase />
            <Testimonials />
            <Footer />
        </div>
    );
};

export default LandingPage;
