import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your ArtSync account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artist@example.com"
              required
              className="bg-transparent border-b border-border focus:border-primary rounded-none px-0"
              data-testid="login-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-transparent border-b border-border focus:border-primary rounded-none px-0"
              data-testid="login-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={isLoading}
            data-testid="login-submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline" data-testid="register-link">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
