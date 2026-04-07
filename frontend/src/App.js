import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useThemeStore, useReferenceStore, useInstitutionStore, useLanguageStore } from "@/store";
import { Navbar } from "@/components/Navbar";
import { Toaster, toast } from "sonner";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Discover from "@/pages/Discover";
import ArtistProfile from "@/pages/ArtistProfile";
import VisitorProfile from "@/pages/VisitorProfile";
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Projects from "@/pages/Projects";
import Statistics from "@/pages/Statistics";
import Feed from "@/pages/Feed";
import Checkout from "@/pages/Checkout";

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  // ✅ FIX 4a: Only redirect when we KNOW there's no token. A null token on
  // first render (before the store rehydrates from localStorage) would cause a
  // flash-redirect to /login. Zustand-persist rehydrates synchronously in most
  // setups, so this check is safe — but if you ever switch to async storage
  // (e.g. AsyncStorage on RN) wrap this in a hydration guard too.
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function InstitutionStatsRoute({ children }) {
  const { user, token } = useAuthStore();
  const { hasPaid } = useInstitutionStore();

  // ✅ FIX 4b: No token → send to login
  if (!token) return <Navigate to="/login" replace />;

  // ✅ FIX 4c: Token exists but user object hasn't arrived from fetchUser() yet.
  // Returning null caused React to render nothing, which triggered an immediate
  // re-evaluation of the route — sometimes entering an infinite render loop
  // when combined with strict mode or fast re-renders.
  // Rendering a minimal loading indicator breaks the loop and gives fetchUser()
  // time to resolve before we decide whether to redirect.
  if (token && user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // ✅ FIX 4d: Institution user who hasn't paid → checkout
  if (user?.role === 'institution' && !hasPaid) return <Navigate to="/checkout" replace />;

  return children;
}

function VisitorRestrictedRoute({ children }) {
  const { user, token } = useAuthStore();
  const { t } = useLanguageStore();
  
  // Only block visitors from protected routes
  if (token && user?.role === 'visitor') {
    // Show a localized toast notification
    toast.error(t?.common?.search ? `${t.nav.visitorBadge || 'Visitor'} accounts cannot access this page` : 'Visitor accounts cannot access this feature');
    return <Navigate to="/discover" replace />;
  }
  
  return children;
}

function App() {
  const { fetchUser, token } = useAuthStore();
  const { theme } = useThemeStore();
  const { fetchReferenceData } = useReferenceStore();
  const { hydrateFromBackend } = useInstitutionStore();

  useEffect(() => {
    if (token) {
      fetchUser();
      hydrateFromBackend();
    }
  }, [token, fetchUser, hydrateFromBackend]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/visitor/:id" element={<VisitorProfile />} />
            <Route path="/projects" element={
              <VisitorRestrictedRoute><Projects /></VisitorRestrictedRoute>
            } />
            <Route path="/statistics" element={
              <InstitutionStatsRoute>
                <Statistics />
              </InstitutionStatsRoute>
            } />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/feed" element={
              <VisitorRestrictedRoute><Feed /></VisitorRestrictedRoute>
            } />
            <Route path="/dashboard" element={
              <VisitorRestrictedRoute>
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              </VisitorRestrictedRoute>
            } />
            <Route path="/messages" element={
              <VisitorRestrictedRoute>
                <ProtectedRoute><Messages /></ProtectedRoute>
              </VisitorRestrictedRoute>
            } />
            <Route path="/messages/:id" element={
              <VisitorRestrictedRoute>
                <ProtectedRoute><Messages /></ProtectedRoute>
              </VisitorRestrictedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
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
    </BrowserRouter>
  );
}

export default App;
