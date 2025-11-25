import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("tce_admin_token");  // ✅ match AdminLogin.js
  if (!token) return <Navigate to="/admin-login" replace />;
  return children;
}

