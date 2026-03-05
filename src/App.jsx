import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./app/common/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import InstallPWA from "./components/common/InstallPWA";

// Lazy load pages for performance
const Home = lazy(() => import("./pages/Home"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Login = lazy(() => import("./app/auth/Login"));
const Register = lazy(() => import("./app/auth/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Directory = lazy(() => import("./pages/Directory"));
const Events = lazy(() => import("./pages/Events"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Donate = lazy(() => import("./pages/Donate"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Resume = lazy(() => import("./pages/Resume"));
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const StudentPortal = lazy(() => import("./pages/StudentPortal"));
const CoachingAdmin = lazy(() => import("./pages/CoachingAdmin"));
const StudentDetails = lazy(() => import("./pages/StudentDetails"));
const CertificateGenerator = lazy(() => import("./pages/CertificateGenerator"));
const CertificateDownload = lazy(() => import("./pages/CertificateDownload"));
const AdminCertificateUpload = lazy(() => import("./pages/AdminCertificateUpload"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-pulse"></div>
      <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <InstallPWA />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/certificate" element={<CertificateDownload />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Protected Routes */}
              <Route path="/directory" element={
                <ProtectedRoute>
                  <Directory />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              } />
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              } />
              <Route path="/resume" element={
                <ProtectedRoute>
                  <Resume />
                </ProtectedRoute>
              } />

              {/* Coaching Management Routes */}
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/student-portal" element={<StudentPortal />} />
              <Route path="/admin/coaching" element={
                <AdminRoute>
                  <CoachingAdmin />
                </AdminRoute>
              } />
              <Route path="/admin/coaching/student/:id" element={
                <AdminRoute>
                  <StudentDetails />
                </AdminRoute>
              } />
              <Route path="/admin/certificates" element={
                <AdminRoute>
                  <CertificateGenerator />
                </AdminRoute>
              } />
              <Route path="/admin/certificates/upload" element={
                <AdminRoute>
                  <AdminCertificateUpload />
                </AdminRoute>
              } />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
