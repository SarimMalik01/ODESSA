import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./pages/auth/AuthLayout";
import Report from "./pages/Report/report";
import SharedReportGate from "./pages/Report/SharedReportGate";

import RAGChat from "./pages/RAGChat/RAGChat";

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

<Route
  path="/chat"
  element={
    <ProtectedRoute>
      <RAGChat />
    </ProtectedRoute>
  }
/>

<Route
  path="/chat/:projectName/:chatId"
  element={
    <ProtectedRoute>
      <RAGChat />
    </ProtectedRoute>
  }
/>
      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
