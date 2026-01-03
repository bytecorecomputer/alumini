export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-6">
                        <h4 className="font-semibold text-gray-900">Expert Support</h4>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">CoderAfroj</p>
                            <p className="text-sm text-gray-500">+91 7017733805</p>
                        </div>
                        <a
                            href="/donate"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                        >
                            Donate Now
                        </a>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary-600">Directory</a></li>
                            <li><a href="#" className="hover:text-primary-600">Events</a></li>
                            <li><a href="#" className="hover:text-primary-600">Careers</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary-600">About Us</a></li>
                            <li><a href="#" className="hover:text-primary-600">Contact</a></li>
                            <li><a href="#" className="hover:text-primary-600">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
                        <p className="text-sm text-gray-500">coderafroj@gmail.com</p>
                        <p className="text-sm text-gray-500">+91 7017733805</p>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Alumni Association. Developed by <span className="text-primary-600 font-bold">CoderAfroj</span>. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
