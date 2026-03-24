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
  const { login, isLoading, error } = useAuthStore();
  const { hydrateFromBackend, hasPaid } = useInstitutionStore();
  const { language, t } = useLanguageStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      const user = result.user || useAuthStore.getState().user;
      if (user?.role === 'institution') {
        // Hydrate payment state from backend then redirect accordingly
        await hydrateFromBackend();
        const paid = useInstitutionStore.getState().hasPaid;
        navigate(paid ? '/statistics' : '/checkout');
      } else {
        navigate('/dashboard');
      }
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
            {language === 'fr' ? 'Bon retour' : 'Welcome back'}
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
