import { motion } from 'framer-motion';
import { ArrowRight, Users, Calendar, Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import bcc from '../assets/BANNER.jpg'

export default function Home() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.100),white)] opacity-20" />
                <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-primary-600/10 ring-1 ring-primary-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-24 sm:pb-32 lg:flex lg:py-40 lg:items-center">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="mt-24 sm:mt-32 lg:mt-16">
                                <a href="#" className="inline-flex space-x-6">
                                    <span className="rounded-full bg-primary-600/10 px-3 py-1 text-sm font-semibold leading-6 text-primary-600 ring-1 ring-inset ring-primary-600/10">
                                        Latest News
                                    </span>
                                    <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                                        <span>Convocation 2025 Announced</span>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                    </span>
                                </a>
                            </div>
                            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                                Alumni<span className="text-primary-600">Connect</span> Universe
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Bridge the gap between past and future. Use this advanced platform to connect with peers, find mentors, and exploring career opportunities. Secure, Real-time, and Premium.
                            </p>
                            <div className="mt-10 flex items-center gap-x-6">
                                <Link
                                    to="/register"
                                    className="rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all hover:scale-105"
                                >
                                    Join the Network
                                </Link>
                                <Link to="/directory" className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 group">
                                    Find Alumni <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Image/Graphic */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32"
                    >
                        <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                                <img
                                    src={bcc}
                                    alt="University Campus"
                                    className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10 opacity-90 hover:opacity-100 transition-opacity"
                                    width={2432}
                                    height={1442}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-primary-900 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:max-w-none">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Trusted by the University Community</h2>
                            <p className="mt-4 text-lg leading-8 text-primary-200">
                                Data stored securely on Firebase Realtime infrastructure.
                            </p>
                        </div>
                        <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { id: 1, name: 'Active Alumni', value: '15,000+' },
                                { id: 2, name: 'Countries Represented', value: '45' },
                                { id: 3, name: 'Yearly Events', value: '120+' },
                                { id: 4, name: 'Mentorships', value: '500+' },
                            ].map((stat) => (
                                <div key={stat.id} className="flex flex-col bg-white/5 p-8 hover:bg-white/10 transition-colors cursor-pointer">
                                    <dt className="text-sm font-semibold leading-6 text-gray-300">{stat.name}</dt>
                                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">{stat.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* Feature Highlights */}
            <div className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary-600">Advanced Features</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to stay connected
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {[
                                {
                                    name: 'Realtime Directory',
                                    description: 'Instantly find batchmates and seniors. Advanced filtering by year, course, and industry.',
                                    icon: Users,
                                },
                                {
                                    name: 'Event Management',
                                    description: 'Register for reunions, webinars, and meetups happening on campus and virtually.',
                                    icon: Calendar,
                                },
                                {
                                    name: 'Verified Profiles',
                                    description: 'All alumni profiles are verified against university records for a secure environment.',
                                    icon: Award,
                                }
                            ].map((feature) => (
                                <div key={feature.name} className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                        <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">{feature.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
