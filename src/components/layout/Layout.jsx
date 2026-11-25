import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminBottomNav from './AdminBottomNav';

const FULL_BLEED_PREFIXES = [
    '/verify',
    '/certificate',
    '/admin/qr-generator',
    '/admin/certificates/upload',
    '/admin/certificates/branding',
    '/admin/analytics',
    '/admin/live-quiz',
    '/student/live-quiz',
    '/gallery',
];

export default function Layout({ children }) {
    const location = useLocation();
    const isFullBleed = FULL_BLEED_PREFIXES.some((prefix) =>
        location.pathname.startsWith(prefix)
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden md:pb-0 pb-[80px]">
            <Navbar />
            <main className={isFullBleed ? 'flex-grow' : 'flex-grow pt-32'}>
                {children}
            </main>
            <Footer />
            <AdminBottomNav />
        </div>
    );
}
