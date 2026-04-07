import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, Building2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ArtistForm({ onSuccess }) {
  const { t } = useLanguageStore();
  const { countries, sectors, domains, genders, fetchReferenceData } = useReferenceStore();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '',
    country: '', subregion: '', gender: '', sector: '', domain: '',
    year_started: new Date().getFullYear() - 5, bio: '', additional_info: '', role: 'artist',
    profile_tag: 'artist'
  });

  const bioLimit = 3000;
  const bioWarningAt = 2800;

  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCountryChange = (value) => {
    const country = countries.find(c => c.name === value);
    setFormData({ ...formData, country: value, subregion: country?.subregion || '' });
  };

  const handleSectorChange = (value) =>
    setFormData({ ...formData, sector: value, domain: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) onSuccess('artist');
  };

  const currentDomains = formData.sector ? (domains[formData.sector] || []) : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-2xl border border-border/50">
      {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.firstName} *</Label>
          <Input name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.lastName} *</Label>
          <Input name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.email} *</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.password} *</Label>
          <Input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.country} *</Label>
          <Select value={formData.country || undefined} onValueChange={handleCountryChange}>
            <SelectTrigger><SelectValue placeholder={t.auth.selectCountry} /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
              {countries.map((c) => (
                <SelectItem key={c.name} value={c.name}>{t.common.isFrench ? (c.name_fr || c.name) : c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.auth.gender} *</Label>
          <Select value={formData.gender || undefined} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
            <SelectTrigger><SelectValue placeholder={t.auth.selectGender} /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100]">
              {genders.map((g) => (
                <SelectItem key={g.name} value={g.name}>{t.common.isFrench ? (g.name_fr || g.name) : g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.subregion && (
        <div className="p-3 bg-secondary/50 rounded-lg text-sm">
          <span className="text-muted-foreground">{t.auth.subregion}: </span>
          <span className="font-medium">
            {t.common.isFrench ? (countries.find(c => c.name === formData.country)?.subregion_fr || formData.subregion) : formData.subregion}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.sector} *</Label>
          <Select value={formData.sector || undefined} onValueChange={handleSectorChange}>
            <SelectTrigger><SelectValue placeholder={t.auth.selectSector} /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100]">
              {sectors.map((s) => (
                <SelectItem key={s.name} value={s.name}>{t.common.isFrench ? (s.name_fr || s.name) : s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.auth.domain} *</Label>
          <Select
            value={formData.domain || undefined}
            onValueChange={(v) => setFormData({ ...formData, domain: v })}
            disabled={!formData.sector}
          >
            <SelectTrigger><SelectValue placeholder={t.auth.selectDomain} /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100]">
              {currentDomains.map((d) => (
                <SelectItem key={d.name} value={d.name}>{t.common.isFrench ? (d.name_fr || d.name) : d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.profileTag} *</Label>
        <Select 
          value={formData.profile_tag} 
          onValueChange={(v) => setFormData({ ...formData, profile_tag: v })}
          required
        >
          <SelectTrigger><SelectValue placeholder={t.auth.profileTag} /></SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-[100]">
            <SelectItem value="artist">{t.auth.artistTag}</SelectItem>
            <SelectItem value="professional">{t.auth.professionalTag}</SelectItem>
            <SelectItem value="media">{t.auth.mediaTag}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.yearStarted} *</Label>
        <Input
          name="year_started" type="number"
          min="1950" max={new Date().getFullYear()}
          value={formData.year_started} onChange={handleChange} required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>{t.auth.bio}</Label>
          <span className={`text-xs font-medium ${formData.bio.length >= bioWarningAt ? (formData.bio.length >= bioLimit ? 'text-destructive' : 'text-amber-500') : 'text-muted-foreground'}`}>
            {formData.bio.length} / {bioLimit}
          </span>
        </div>
        <Textarea 
          name="bio" 
          value={formData.bio} 
          onChange={(e) => {
            if (e.target.value.length <= bioLimit) handleChange(e);
          }} 
          rows={5}
          placeholder={t.auth.bioPlaceholder} 
        />
        {formData.bio.length >= bioLimit && (
          <p className="text-[10px] text-destructive font-medium uppercase tracking-wider mt-1 animate-pulse">Max character limit reached</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t.auth.additionalInfo}</Label>
        <Textarea name="additional_info" value={formData.additional_info} onChange={handleChange} rows={2}
          placeholder={t.auth.additionalInfoPlaceholder} />
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
        {isLoading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.auth.creating}</>
          : t.auth.register}
      </Button>
    </form>
  );
}

function InstitutionForm({ onSuccess }) {
  const { t } = useLanguageStore();
  const { countries, fetchReferenceData } = useReferenceStore();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '',
    organization_name: '', country: '', subregion: '',
    gender: 'Other', sector: 'Arts & Culture', domain: 'Institution',
    year_started: new Date().getFullYear(), bio: '', role: 'institution',
  });

  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCountryChange = (value) => {
    const country = countries.find(c => c.name === value);
    setFormData({ ...formData, country: value, subregion: country?.subregion || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) onSuccess('institution');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-2xl border border-border/50">
      {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <div className="space-y-2">
        <Label>{t.auth.organizationName} *</Label>
        <Input name="organization_name" value={formData.organization_name} onChange={handleChange}
          placeholder={t.auth.orgNamePlaceholder} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.contactFirstName} *</Label>
          <Input name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.contactLastName} *</Label>
          <Input name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.email} *</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} required
            placeholder={t.auth.emailPlaceholder} />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.password} *</Label>
          <Input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.country} *</Label>
        <Select value={formData.country || undefined} onValueChange={handleCountryChange}>
          <SelectTrigger><SelectValue placeholder={t.auth.selectCountry} /></SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
            {countries.map((c) => (
              <SelectItem key={c.name} value={c.name}>{t.common.isFrench ? (c.name_fr || c.name) : c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.subregion && (
        <div className="p-3 bg-secondary/50 rounded-lg text-sm">
          <span className="text-muted-foreground">{t.auth.subregion}: </span>
          <span className="font-medium">
            {t.common.isFrench ? (countries.find(c => c.name === formData.country)?.subregion_fr || formData.subregion) : formData.subregion}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t.auth.missionDescription}</Label>
        <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
          placeholder={t.auth.missionPlaceholder} />
      </div>

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm space-y-1">
        <p className="font-semibold text-primary">{t.auth.statsAccessTitle}</p>
        <p className="text-muted-foreground">
          {t.auth.statsAccessInfo}
        </p>
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
        {isLoading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.auth.creating}</>
          : t.auth.createInstitution}
      </Button>
    </form>
  );
}

function VisitorForm({ onSuccess }) {
  const { t } = useLanguageStore();
  const { countries, fetchReferenceData } = useReferenceStore();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '',
    country: '', subregion: '',
    gender: null, sector: null, domain: null, year_started: null,
    visitor_type: 'individual',
    organization_name: '',
    role: 'visitor',
  });

  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCountryChange = (value) => {
    const country = countries.find(c => c.name === value);
    setFormData({ ...formData, country: value, subregion: country?.subregion || '' });
  };

  const handleVisitorTypeChange = (value) => {
    setFormData({ ...formData, visitor_type: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) onSuccess('visitor');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-2xl border border-border/50">
      {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <div className="p-4 bg-secondary/50 border border-secondary/50 rounded-xl text-sm">
        <p className="text-muted-foreground">
          {t.auth.visitorInfo}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.visitorType} *</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'individual', label: t.auth.individual },
            { value: 'organisation', label: t.auth.organisation },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleVisitorTypeChange(value)}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.visitor_type === value ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-card text-muted-foreground hover:border-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.firstName} *</Label>
          <Input name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.lastName} *</Label>
          <Input name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.email} *</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.password} *</Label>
          <Input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
        </div>
      </div>

      {formData.visitor_type === 'organisation' && (
        <div className="space-y-2">
          <Label>{t.auth.organisationName} *</Label>
          <Input name="organization_name" value={formData.organization_name} onChange={handleChange} required />
        </div>
      )}

      <div className="space-y-2">
        <Label>{t.auth.country} *</Label>
        <Select value={formData.country || undefined} onValueChange={handleCountryChange}>
          <SelectTrigger><SelectValue placeholder={t.auth.selectCountry} /></SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
            {countries.map((c) => (
              <SelectItem key={c.name} value={c.name}>{t.common.isFrench ? (c.name_fr || c.name) : c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.subregion && (
        <div className="p-3 bg-secondary/50 rounded-lg text-sm">
          <span className="text-muted-foreground">{t.auth.subregion}: </span>
          <span className="font-medium">
            {t.common.isFrench ? (countries.find(c => c.name === formData.country)?.subregion_fr || formData.subregion) : formData.subregion}
          </span>
        </div>
      )}

      <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
        {isLoading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.auth.creating}</>
          : t.auth.register}
      </Button>
    </form>
  );
}

export default function Register() {
  const { language, t } = useLanguageStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('artist');

  const handleSuccess = (role) => {
    if (role === 'institution') navigate('/checkout');
    else if (role === 'visitor') navigate('/discover');
    else navigate('/dashboard');
  };

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
            {t.auth.joinACA}
          </h1>
          <p className="text-muted-foreground">{t.auth.chooseAccountType}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {[
            { key: 'artist', icon: Palette, label: t.auth.artist, sub: t.auth.portfolioNetwork },
            { key: 'institution', icon: Building2, label: t.auth.institution, sub: t.auth.statsAccess },
            { key: 'visitor', icon: Users, label: t.auth.visitor, sub: t.auth.exploreDiscover },
          ].map(({ key, icon: Icon, label, sub }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                tab === key ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-card text-muted-foreground hover:border-border'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs opacity-70">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'artist' ? (
            <motion.div key="artist" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <ArtistForm onSuccess={handleSuccess} />
            </motion.div>
          ) : tab === 'institution' ? (
            <motion.div key="institution" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <InstitutionForm onSuccess={handleSuccess} />
            </motion.div>
          ) : (
            <motion.div key="visitor" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <VisitorForm onSuccess={handleSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {t.auth.alreadyAccount}{' '}
          <Link to="/login" className="text-primary hover:underline">{t.auth.signInHere}</Link>
        </p>
      </motion.div>
    </div>
  );
}
