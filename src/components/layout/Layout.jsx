import Navbar from './Navbar';
import Footer from './Footer';
import AdminBottomNav from './AdminBottomNav';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden md:pb-0 pb-[80px]">
            <Navbar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <Footer />
            <AdminBottomNav />
        </div>
    );
}
