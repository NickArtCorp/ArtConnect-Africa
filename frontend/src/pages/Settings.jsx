import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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

export default function Settings() {
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    artist_type: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      artist_type: user.artist_type || 'Visual Artist',
      bio: user.bio || '',
      avatar: user.avatar || ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    setSaving(false);

    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  if (!user) return null;

  const initials = formData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Settings
          </span>
          <h1 className="text-4xl font-bold tracking-tighter mt-2 mb-8">
            Edit Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8" data-testid="settings-form">
            {/* Avatar Preview */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.avatar} alt={formData.name} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-2"
                  data-testid="settings-avatar"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL to your profile image
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name or alias"
                required
                className="bg-transparent border-b border-border focus:border-primary rounded-none px-0"
                data-testid="settings-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist_type">Artist Type</Label>
              <Select
                value={formData.artist_type}
                onValueChange={(value) => setFormData({ ...formData, artist_type: value })}
              >
                <SelectTrigger className="bg-transparent border-b border-border rounded-none px-0" data-testid="settings-artist-type">
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
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell others about yourself and your art..."
                rows={5}
                className="resize-none"
                data-testid="settings-bio"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="rounded-full px-8"
                disabled={saving}
                data-testid="settings-save"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => navigate('/dashboard')}
                data-testid="settings-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
