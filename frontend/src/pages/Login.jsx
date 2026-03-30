import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useInstitutionStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ FIX 2a: Destructure clearError so we can reset stale error state before
  // each attempt. Without this, a previous error message lingers on retry.
  const { login, isLoading, error, clearError } = useAuthStore();
  const { hydrateFromBackend } = useInstitutionStore();
  const { language, t } = useLanguageStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIX 2b: Clear any prior auth error before the new attempt so the UI
    // doesn't flash a stale message and the store starts from a clean state.
    clearError?.();

    try {
      // ✅ FIX 2c: login() now returns the full result synchronously via await.
      // Previously the code was reading result.user but the login() call itself
      // may have resolved before the store was updated — this guarantees we
      // have the user object directly from the response, not from stale state.
      const result = await login(email, password);
      if (!result?.success) return;

      const user = result.user;

      if (user?.role === 'institution') {
        // ✅ FIX 2d: await hydrateFromBackend() BEFORE reading hasPaid from the
        // store. The original code was calling getState().hasPaid immediately
        // after initiating (not awaiting) hydrateFromBackend, so it always read
        // the pre-hydration value (false), sending paying institutions to /checkout.
        await hydrateFromBackend();

        // Read from store only AFTER hydration has settled
        const hasPaidNow = useInstitutionStore.getState().hasPaid;
        navigate(hasPaidNow ? '/statistics' : '/checkout');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Unexpected errors (network failures, etc.) are caught here.
      // The auth store's own error state handles known API errors.
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {language === 'fr' ? 'Bon retour ' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'fr' ? 'Connectez-vous à Art Connect Africa' : 'Sign in to Art Connect Africa'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border/50" data-testid="login-form">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artist@example.com" required data-testid="login-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required data-testid="login-password"
            />
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={isLoading} data-testid="login-submit">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{language === 'fr' ? 'Connexion...' : 'Signing in...'}</>
            ) : t.auth.login}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="text-primary hover:underline" data-testid="register-link">
            {t.auth.createOne}
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg text-sm space-y-1">
          <p className="font-medium mb-2">{language === 'fr' ? 'Comptes de démonstration :' : 'Demo accounts:'}</p>
          <p className="text-muted-foreground">🎨 amara.diallo@artconnect.africa / password123</p>
          <p className="text-muted-foreground">🏛 mc@artconnect.africa / institution123</p>
          <p className="text-muted-foreground">🔑 admin@artconnect.africa / admin123</p>
        </div>
      </motion.div>
    </div>
  );
}
