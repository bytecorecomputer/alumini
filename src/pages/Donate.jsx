import { motion } from 'framer-motion';
import { Heart, Building, GraduationCap, ArrowRight, CreditCard, Gift } from 'lucide-react';

export default function Donate() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block p-4 bg-red-50 rounded-full text-red-600 mb-6 shadow-sm"
                    >
                        <Heart size={48} fill="currentColor" />
                    </motion.div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Give Back to Your Alma Mater</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your contributions help fund scholarships, improve campus facilities, and support the next generation of leaders.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <DonationCard
                        icon={GraduationCap}
                        title="Scholarship Fund"
                        description="Support tuition for meritorious students from underprivileged backgrounds."
                        color="bg-blue-500"
                    />
                    <DonationCard
                        icon={Building}
                        title="Campus Development"
                        description="Help build state-of-the-art labs, libraries, and recreational centers."
                        color="bg-amber-500"
                    />
                    <DonationCard
                        icon={Gift}
                        title="Alumni Events"
                        description="Sponsor annual meetups and networking events for the community."
                        color="bg-green-500"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-primary-900 p-8 text-white text-center">
                        <h2 className="text-2xl font-bold mb-2">Make a Donation</h2>
                        <p className="opacity-90">Secure payment gateway powered by Razorpay / Stripe (Mock)</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {['₹1,000', '₹5,000', '₹10,000', 'Other'].map((amt) => (
                                <button key={amt} className="p-4 rounded-xl border-2 border-gray-100 font-bold text-gray-700 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50 transition-all">
                                    {amt}
                                </button>
                            ))}
                        </div>

                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Redirecting to Payment Gateway..."); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500" placeholder="john@example.com" />
                                </div>
                            </div>

                            <button className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition shadow-lg flex items-center justify-center gap-2">
                                <CreditCard size={24} /> Proceed to Pay
                            </button>
                        </form>
                    </div>
                </div>

                <div className="my-16 bg-blue-50 p-8 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Building className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg">Bank Transfer Details</h3>
                        <p className="text-blue-700 mt-1">If you prefer direct bank transfer, please use the following details:</p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-blue-800 font-mono text-sm">
                            <p>Account Name: <span className="font-bold">Alumni Association Fund</span></p>
                            <p>Account No: <span className="font-bold">123 456 7890</span></p>
                            <p>IFSC Code: <span className="font-bold">HDFC0001234</span></p>
                            <p>Branch: <span className="font-bold">University Campus, New Delhi</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DonationCard({ icon: Icon, title, description, color }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center"
        >
            <div className={`mx-auto h-16 w-16 rounded-full ${color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                <Icon size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}
