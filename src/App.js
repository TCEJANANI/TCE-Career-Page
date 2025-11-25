import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import FormPage from "./pages/FormPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ThankYou from "./pages/ThankYou";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/thankyou" element={<ThankYou />} />

        {/* Redirect /admin to login */}
        <Route path="/admin" element={<Navigate to="/admin-login" replace />} />

        {/* Admin login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Admin dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
