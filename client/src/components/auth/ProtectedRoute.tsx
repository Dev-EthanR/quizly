import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
