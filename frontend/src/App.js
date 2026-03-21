import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useThemeStore } from "@/store";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Discover from "@/pages/Discover";
import ArtistProfile from "@/pages/ArtistProfile";
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const { fetchUser, token } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Seed data on first load (for demo purposes)
  useEffect(() => {
    const seedData = async () => {
      try {
        const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
        await fetch(`${API}/seed`, { method: 'POST' });
      } catch (e) {
        console.log('Seed data already exists or failed');
      }
    };
    seedData();
  }, []);

  return (
    <div className={`App min-h-screen bg-background text-foreground`}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/artist/:id" element={<ArtistProfile />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages/:id" 
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
}

export default App;
