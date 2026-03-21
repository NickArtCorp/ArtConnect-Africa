import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateProfile } = useAuthStore();
  const { countries, sectors, domains, fetchReferenceData } = useReferenceStore();
  const { language, t } = useLanguageStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    country: '',
    subregion: '',
    sector: '',
    domain: '',
    bio: '',
    additional_info: '',
    website: '',
    avatar: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReferenceData();
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      country: user.country || '',
      subregion: user.subregion || '',
      sector: user.sector || '',
      domain: user.domain || '',
      bio: user.bio || '',
      additional_info: user.additional_info || '',
      website: user.website || '',
      avatar: user.avatar || ''
    });
  }, [user, navigate, fetchReferenceData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (value) => {
    const country = countries.find(c => c.name === value);
    setFormData({ 
      ...formData, 
      country: value,
      subregion: country?.subregion || ''
    });
  };

  const handleSectorChange = (value) => {
    setFormData({ ...formData, sector: value, domain: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    setSaving(false);

    if (result.success) {
      toast.success(language === 'fr' ? 'Profil mis à jour !' : 'Profile updated!');
    } else {
      toast.error(result.error || (language === 'fr' ? 'Échec de la mise à jour' : 'Update failed'));
    }
  };

  if (!user) return null;

  const fullName = `${formData.first_name} ${formData.last_name}`;
  const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase();
  const currentDomains = formData.sector ? (domains[formData.sector] || []) : [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            {language === 'fr' ? 'Paramètres' : 'Settings'}
          </span>
          <h1 className="text-4xl font-bold tracking-tight mt-2 mb-8">
            {t.profile.editProfile}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border/50" data-testid="settings-form">
            {/* Avatar Preview */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.avatar} alt={fullName} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar">{language === 'fr' ? 'URL de l\'avatar' : 'Avatar URL'}</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-2"
                  data-testid="settings-avatar"
                />
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t.auth.firstName}</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  data-testid="settings-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t.auth.lastName}</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  data-testid="settings-lastname"
                />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label>{t.auth.country}</Label>
              <Select value={formData.country} onValueChange={handleCountryChange}>
                <SelectTrigger data-testid="settings-country">
                  <SelectValue placeholder={t.auth.selectCountry} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {countries.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {language === 'fr' ? c.name_fr : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.subregion && (
                <p className="text-sm text-muted-foreground">
                  {t.auth.subregion}: {language === 'fr' 
                    ? countries.find(c => c.name === formData.country)?.subregion_fr 
                    : formData.subregion}
                </p>
              )}
            </div>

            {/* Sector & Domain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.auth.sector}</Label>
                <Select value={formData.sector} onValueChange={handleSectorChange}>
                  <SelectTrigger data-testid="settings-sector">
                    <SelectValue placeholder={t.auth.selectSector} />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {language === 'fr' ? s.name_fr : s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.auth.domain}</Label>
                <Select 
                  value={formData.domain} 
                  onValueChange={(v) => setFormData({...formData, domain: v})}
                  disabled={!formData.sector}
                >
                  <SelectTrigger data-testid="settings-domain">
                    <SelectValue placeholder={t.auth.selectDomain} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentDomains.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        {language === 'fr' ? d.name_fr : d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">{t.auth.bio}</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                data-testid="settings-bio"
              />
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <Label htmlFor="additional_info">{t.auth.additionalInfo}</Label>
              <Textarea
                id="additional_info"
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                rows={2}
                data-testid="settings-additional"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">{t.auth.website}</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
                data-testid="settings-website"
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
                    {language === 'fr' ? 'Enregistrement...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t.common.save}
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
                {t.common.cancel}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
