import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminBottomNav from './AdminBottomNav';
import CodeLabsNavbar from './CodeLabsNavbar';

export default function Layout({ children }) {
    const location = useLocation();
    const isCodeLabs = location.pathname.startsWith('/coderafroj');

    if (isCodeLabs) {
        return (
            <div className="min-h-screen flex flex-col bg-[#050505] overflow-hidden">
                <CodeLabsNavbar />
                <main className="flex-grow flex flex-col relative">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden md:pb-0 pb-[80px]">
            <Navbar />
            <main className="flex-grow pt-32">
                {children}
            </main>
            <Footer />
            <AdminBottomNav />
        </div>
    );
}
