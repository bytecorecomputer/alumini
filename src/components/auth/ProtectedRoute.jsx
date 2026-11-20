import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../app/common/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, allowStudent = true }) {
    const { user, student, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
            </div>
        );
    }

    if (!user && !(allowStudent && student)) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
