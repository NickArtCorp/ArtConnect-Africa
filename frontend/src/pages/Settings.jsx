import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Check, Camera, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/utils';

export default function Settings() {
  const { user, updateProfile, uploadAvatar } = useAuthStore();
  const { countries, sectors, domains, fetchReferenceData } = useReferenceStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    country: '',
    subregion: '',
    sector: '',
    domain: '',
    bio: '',
    additional_info: '',
    website: ''
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
      website: user.website || ''
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(t.settings.invalidFileType);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.settings.fileTooLarge);
      return;
    }

    setUploadingAvatar(true);
    const result = await uploadAvatar(file);
    setUploadingAvatar(false);

    if (result.success) {
      toast.success(t.settings.photoUpdated);
    } else {
      toast.error(result.error || t.settings.uploadFailed);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    setSaving(false);

    if (result.success) {
      toast.success(t.settings.profileUpdated);
    } else {
      toast.error(result.error || t.settings.updateFailed);
    }
  };

  if (!user) return null;

  const fullName = `${formData.first_name} ${formData.last_name}`;
  const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase();
  const currentDomains = formData.sector ? (domains[formData.sector] || []) : [];
  const avatarUrl = getMediaUrl(user.avatar);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            {t.settings.title}
          </span>
          <h1 className="text-4xl font-bold tracking-tight mt-2 mb-8">
            {t.profile.editProfile}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border/50" data-testid="settings-form">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="text-3xl bg-primary/10">{initials}</AvatarFallback>
                </Avatar>
                
                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  data-testid="avatar-upload-button"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                />
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="rounded-full gap-2"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {t.settings.changePhoto}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG, GIF or WebP. Max 5MB.
              </p>
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
                      {t.common.isFrench ? (c.name_fr || c.name) : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.subregion && (
                <p className="text-sm text-muted-foreground">
                  {t.auth.subregion}: {t.common.isFrench 
                    ? (countries.find(c => c.name === formData.country)?.subregion_fr || formData.subregion)
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
                        {t.common.isFrench ? (s.name_fr || s.name) : s.name}
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
                        {t.common.isFrench ? (d.name_fr || d.name) : d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="bio">{t.auth.bio}</Label>
                <span className={`text-xs font-medium ${(formData.bio?.length || 0) >= 2800 ? ((formData.bio?.length || 0) >= 3000 ? 'text-destructive' : 'text-amber-500') : 'text-muted-foreground'}`}>
                  {formData.bio?.length || 0} / 3000
                </span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 3000) handleChange(e);
                }}
                rows={6}
                data-testid="settings-bio"
                placeholder={t.auth.bioPlaceholder}
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
                    {t.settings.saving}
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
