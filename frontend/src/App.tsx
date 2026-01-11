import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./pages/auth/AuthLayout";
import Report from "./pages/Report/report";
import SharedReportGate from "./pages/Report/SharedReportGate";
export default function App() {
  return (
    <Routes>
      {/* Auth layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ Protected report page */}
      <Route
        path="/report/:projectId"
        element={<Report/>}
      />
      
      <Route
  path="/report/shared/:token"
  element={<SharedReportGate />}
/>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
