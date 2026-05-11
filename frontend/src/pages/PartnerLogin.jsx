import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useInstitutionStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PartnerLogin() {
  const [partnerCode, setPartnerCode] = useState('');
  const { partnerLogin, isLoading, error, clearError } = useAuthStore();
  const { hydrateFromBackend } = useInstitutionStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError?.();

    try {
      const result = await partnerLogin(partnerCode);
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
      console.error('Partner login error:', err);
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
            Partner Access
          </h1>
          <p className="text-muted-foreground">
            Enter your partner code to access the platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border/50">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

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
              className="font-mono text-center text-lg letter-spacing-2"
            />
            <p className="text-xs text-muted-foreground">
              This code was provided to you by Art Connect Africa
            </p>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={isLoading || !partnerCode.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.auth.signingIn || 'Signing in...'}
              </>
            ) : (
              'Access Platform'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full rounded-full"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Don't have a partner code? <span className="font-medium">Contact support</span></p>
        </div>
      </motion.div>
    </div>
  );
}
