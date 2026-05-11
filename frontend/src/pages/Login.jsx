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
  const [partnerCode, setPartnerCode] = useState('');
  const [isPartnerMode, setIsPartnerMode] = useState(false);

  const { login, partnerLogin, isLoading, error, clearError } = useAuthStore();
  const { hydrateFromBackend } = useInstitutionStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError?.();

    try {
      let result;
      if (isPartnerMode) {
        result = await partnerLogin(partnerCode);
      } else {
        result = await login(email, password);
      }
      
      if (!result?.success) return;

      const user = result.user;

      if (user?.role === 'partenaire') {
        await hydrateFromBackend();
        const hasPaidNow = useInstitutionStore.getState().hasPaid;
        navigate(hasPaidNow ? '/statistics' : '/checkout');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
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
            {isPartnerMode ? 'Partner Access' : t.auth.welcomeBack}
          </h1>
          <p className="text-muted-foreground">
            {isPartnerMode ? 'Enter your partner code to access the platform' : t.auth.signInTo}
          </p>
        </div>

        {/* Toggle between normal and partner login */}
        <div className="flex gap-2 mb-6 bg-secondary/50 p-1 rounded-full">
          <button
            type="button"
            onClick={() => {
              setIsPartnerMode(false);
              clearError?.();
            }}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              !isPartnerMode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPartnerMode(true);
              clearError?.();
            }}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              isPartnerMode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Partner Code
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border/50" data-testid="login-form">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          {!isPartnerMode ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
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
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="partner-code">Partner Code</Label>
              <Input
                id="partner-code"
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="Enter your unique partner code"
                required
                disabled={isLoading}
                className="font-mono text-center text-lg"
              />
              <p className="text-xs text-muted-foreground">
                This code was provided to you by Art Connect Africa
              </p>
            </div>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={isLoading} data-testid="login-submit">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.auth.signingIn}</>
            ) : isPartnerMode ? 'Access Platform' : t.auth.login}
          </Button>
        </form>

        {!isPartnerMode && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-primary hover:underline" data-testid="register-link">
              {t.auth.createOne}
            </Link>
          </p>
        )}

        {!isPartnerMode && (
          <div className="mt-6 p-4 bg-secondary/50 rounded-lg text-sm space-y-1">
            <p className="font-medium mb-2">{t.auth.demoAccounts}</p>
            <p className="text-muted-foreground">🎨 amara.diallo@artconnect.africa / password123</p>
            <p className="text-muted-foreground">🏛 mc@artconnect.africa / institution123</p>
            <p className="text-muted-foreground">🔑 admin@artconnect.africa / admin123</p>
          </div>
        )}

      </motion.div>
    </div>
  );
}
