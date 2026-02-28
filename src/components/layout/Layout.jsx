import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from '../ui/CustomCursor';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden cursor-none">
            <CustomCursor />
            <Navbar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
}
