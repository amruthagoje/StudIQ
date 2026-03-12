import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import FloatingXP from "./components/FloatingXP";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Worlds from "./pages/Worlds";
import Chat from "./pages/Chat";
import Quests from "./pages/Quests";
import Quiz from "./pages/Quiz";
import Progress from "./pages/Progress";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="font-pixel text-accent text-xs animate-pulse">LOADING STUDIQ...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppContent() {
  const { user } = useAuth();
  return (
    <div className="scanlines min-h-screen bg-bg">
      {user && <Navbar />}
      {user && <FloatingXP />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1a1a2e", color: "#e8e8f5", border: "1px solid #2a2a45", fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
          success: { iconTheme: { primary: "#10b981", secondary: "#1a1a2e" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#1a1a2e" } },
        }}
      />
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/worlds" element={<PrivateRoute><Worlds /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/quests" element={<PrivateRoute><Quests /></PrivateRoute>} />
        <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
