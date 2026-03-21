import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ARTIST_TYPES = [
  'Visual Artist',
  'Digital Artist',
  'Music Producer',
  'Musician',
  'Photographer',
  'Designer',
  'Visual Designer',
  '3D Artist',
  'Painter',
  'Sculptor',
  'Illustrator',
  'Filmmaker',
  'Animator',
  'Writer',
  'Other'
];

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    artist_type: 'Visual Artist',
    bio: ''
  });
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
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
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Join ArtSync</h1>
          <p className="text-muted-foreground">Create your artist profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="register-form">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm" data-testid="register-error">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Artist Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name or alias"
              required
              className="bg-transparent border-b border-border focus:border-primary rounded-none px-0"
              data-testid="register-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="artist@example.com"
              required
              className="bg-transparent border-b border-border focus:border-primary rounded-none px-0"
              data-testid="register-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-transparent border-b border-border focus:border-primary rounded-none px-0"
              data-testid="register-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist_type">Artist Type</Label>
            <Select
              value={formData.artist_type}
              onValueChange={(value) => setFormData({ ...formData, artist_type: value })}
            >
              <SelectTrigger className="bg-transparent border-b border-border rounded-none px-0" data-testid="register-artist-type">
                <SelectValue placeholder="Select your craft" />
              </SelectTrigger>
              <SelectContent>
                {ARTIST_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself and your art..."
              rows={3}
              className="bg-transparent border border-border focus:border-primary resize-none"
              data-testid="register-bio"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={isLoading}
            data-testid="register-submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline" data-testid="login-link">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
