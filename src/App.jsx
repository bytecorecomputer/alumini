import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./app/common/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import InstallPWA from "./components/common/InstallPWA";
import NotificationHandler from "./components/common/NotificationHandler";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Lazy load pages for performance
const NotFound = lazy(() => import("./pages/NotFound"));
const Home = lazy(() => import("./pages/Home"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const QuizHub = lazy(() => import("./pages/QuizHub"));
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
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));
const LabGallery = lazy(() => import("./pages/LabGallery"));
const ResourceManager = lazy(() => import("./pages/ResourceManager"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminLiveQuiz = lazy(() => import("./pages/AdminLiveQuiz"));
const AdminQuizBuilder = lazy(() => import("./pages/AdminQuizBuilder"));
const AdminQRGenerator = lazy(() => import("./pages/AdminQRGenerator"));
const StudentLiveQuiz = lazy(() => import('./pages/StudentLiveQuiz'));
const ExpertManager = lazy(() => import('./pages/ExpertManager'));

const PublicQuiz = lazy(() => import("./pages/PublicQuiz"));
const NotesHub = lazy(() => import("./pages/NotesHub"));
const CoderAfroj = lazy(() => import("./pages/CoderAfroj"));
const Workspace = lazy(() => import("./pages/Workspace"));
const CertificateVerification = lazy(() => import("./pages/CertificateVerification"));

// Loading fallback with delayed render to prevent flash
const PageLoader = () => {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200); // Only show loader if taking more than 200ms
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999]">
      <div className="h-1 bg-blue-500/20 w-full overflow-hidden">
        <div className="h-full bg-blue-600 w-1/2 animate-[ping-pong_1s_ease-in-out_infinite] shadow-[0_0_10px_#2563eb]"></div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
          <InstallPWA />
          <NotificationHandler />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/student-portal" element={<StudentPortal />} />
              <Route path="/certificate" element={<CertificateDownload />} />
              <Route path="/quizzes" element={<QuizHub />} />
              <Route path="/notes" element={<NotesHub />} />
              <Route path="/quiz/:courseId/:topicId" element={<PublicQuiz />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/coderafroj" element={<CoderAfroj />} />
              <Route path="/coderafroj/:problemId" element={<Workspace />} />
              <Route path="/verify/:certId" element={<CertificateVerification />} />

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
              <Route path="/admin/notifications" element={
                <AdminRoute>
                  <AdminNotifications />
                </AdminRoute>
              } />
              <Route path="/admin/resources" element={
                <AdminRoute>
                  <ResourceManager />
                </AdminRoute>
              } />
              <Route path="/admin/experts" element={
                <AdminRoute>
                  <ExpertManager />
                </AdminRoute>
              } />
              <Route path="/admin/analytics" element={
                <AdminRoute>
                  <AdminAnalytics />
                </AdminRoute>
              } />
              <Route path="/admin/live-quiz" element={
                <AdminRoute>
                  <AdminLiveQuiz />
                </AdminRoute>
              } />
              <Route path="/admin/quiz-builder" element={
                <AdminRoute>
                  <AdminQuizBuilder />
                </AdminRoute>
              } />
              <Route path="/admin/qr-generator" element={
                <AdminRoute>
                  <AdminQRGenerator />
                </AdminRoute>
              } />
              <Route path="/student/live-quiz" element={<StudentLiveQuiz />} />
              <Route path="/lab-gallery" element={<LabGallery />} />
              
              {/* 404 Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
