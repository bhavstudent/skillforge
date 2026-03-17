import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRouter({ children }) {
    const { user, loading } = useAuth();

    if(loading) {
        return (
            <div className="loading-protected">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children;
}