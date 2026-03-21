import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const { language, t } = useLanguageStore();
  const { countries, sectors, domains, genders, fetchReferenceData } = useReferenceStore();
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    country: '',
    subregion: '',
    gender: '',
    sector: '',
    domain: '',
    year_started: new Date().getFullYear() - 5,
    bio: '',
    additional_info: ''
  });

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

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
    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const currentDomains = formData.sector ? (domains[formData.sector] || []) : [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {language === 'fr' ? 'Rejoignez Art Connect Africa' : 'Join Art Connect Africa'}
          </h1>
          <p className="text-muted-foreground">{t.auth.register}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border/50" data-testid="register-form">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm" data-testid="register-error">
              {error}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">{t.auth.firstName} *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                data-testid="register-firstname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">{t.auth.lastName} *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                data-testid="register-lastname"
              />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email} *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                data-testid="register-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password} *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                data-testid="register-password"
              />
            </div>
          </div>

          {/* Country & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.auth.country} *</Label>
              <Select value={formData.country} onValueChange={handleCountryChange}>
                <SelectTrigger data-testid="register-country">
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
            </div>
            <div className="space-y-2">
              <Label>{t.auth.gender} *</Label>
              <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                <SelectTrigger data-testid="register-gender">
                  <SelectValue placeholder={t.auth.selectGender} />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g.name} value={g.name}>
                      {language === 'fr' ? g.name_fr : g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subregion display */}
          {formData.subregion && (
            <div className="p-3 bg-secondary/50 rounded-lg text-sm">
              <span className="text-muted-foreground">{t.auth.subregion}: </span>
              <span className="font-medium">
                {language === 'fr' 
                  ? countries.find(c => c.name === formData.country)?.subregion_fr 
                  : formData.subregion}
              </span>
            </div>
          )}

          {/* Sector & Domain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.auth.sector} *</Label>
              <Select value={formData.sector} onValueChange={handleSectorChange}>
                <SelectTrigger data-testid="register-sector">
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
              <Label>{t.auth.domain} *</Label>
              <Select 
                value={formData.domain} 
                onValueChange={(v) => setFormData({...formData, domain: v})}
                disabled={!formData.sector}
              >
                <SelectTrigger data-testid="register-domain">
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

          {/* Year Started */}
          <div className="space-y-2">
            <Label htmlFor="year_started">{t.auth.yearStarted} *</Label>
            <Input
              id="year_started"
              name="year_started"
              type="number"
              min="1950"
              max={new Date().getFullYear()}
              value={formData.year_started}
              onChange={handleChange}
              required
              data-testid="register-year"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">{t.auth.bio}</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder={language === 'fr' ? 'Parlez-nous de vous et de votre art...' : 'Tell us about yourself and your art...'}
              data-testid="register-bio"
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
              placeholder={language === 'fr' ? 'Expositions, prix, collaborations notables...' : 'Exhibitions, awards, notable collaborations...'}
              data-testid="register-additional"
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
                {language === 'fr' ? 'Création...' : 'Creating...'}
              </>
            ) : (
              t.auth.register
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {t.auth.alreadyAccount}{' '}
          <Link to="/login" className="text-primary hover:underline" data-testid="login-link">
            {t.auth.signInHere}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
