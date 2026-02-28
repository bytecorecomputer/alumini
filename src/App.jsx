import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Login from "./app/auth/Login";
import Register from "./app/auth/Register";
import Profile from "./pages/Profile";
import Directory from "./pages/Directory";
import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import Donate from "./pages/Donate";
import { AuthProvider } from "./app/common/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Resume from "./pages/Resume";
import StudentLogin from "./pages/StudentLogin";
import StudentPortal from "./pages/StudentPortal";
import CoachingAdmin from "./pages/CoachingAdmin";
import StudentDetails from "./pages/StudentDetails";
import CertificateGenerator from "./pages/CertificateGenerator";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/about" element={<About />} />
            <Route path="/donate" element={<Donate />} />

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
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
