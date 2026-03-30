import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ArtistForm({ onSuccess }) {
  const { language, t } = useLanguageStore();
  const { countries, sectors, domains, genders, fetchReferenceData } = useReferenceStore();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '',
    country: '', subregion: '', gender: '', sector: '', domain: '',
    year_started: new Date().getFullYear() - 5, bio: '', additional_info: '', role: 'artist',
  });

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
  const fr = language === 'fr';

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
          {/*
            ✅ FIX 3a: value={formData.country || undefined}
            An empty string "" is a valid controlled value in Radix Select but
            won't match any SelectItem (which are never ""), so the placeholder
            never shows. Coercing "" → undefined lets Radix treat the field as
            uncontrolled / unselected and correctly renders the placeholder.

            ✅ FIX 3b: position="popper" + className="z-[100]"
            Even though select.jsx now uses Portal (which already escapes the
            stacking context), the explicit z-[100] class acts as a safety net
            for cases where other portalled elements (modals, tooltips) may
            overlap. position="popper" also aligns the dropdown under the
            trigger instead of centering it in the viewport.
          */}
          <Select value={formData.country || undefined} onValueChange={handleCountryChange}>
            <SelectTrigger><SelectValue placeholder={t.auth.selectCountry} /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
              {countries.map((c) => (
                <SelectItem key={c.name} value={c.name}>{fr ? c.name_fr : c.name}</SelectItem>
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
                <SelectItem key={g.name} value={g.name}>{fr ? g.name_fr : g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.subregion && (
        <div className="p-3 bg-secondary/50 rounded-lg text-sm">
          <span className="text-muted-foreground">{t.auth.subregion}: </span>
          <span className="font-medium">
            {fr ? countries.find(c => c.name === formData.country)?.subregion_fr : formData.subregion}
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
                <SelectItem key={s.name} value={s.name}>{fr ? s.name_fr : s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.auth.domain} *</Label>
          {/*
            ✅ FIX 3c: disabled={!formData.sector} correctly blocks interaction
            when no sector is chosen. Also using value || undefined to keep
            the placeholder visible after a sector change resets domain to "".
          */}
          <Select
            value={formData.domain || undefined}
            onValueChange={(v) => setFormData({ ...formData, domain: v })}
            disabled={!formData.sector}
          >
            <SelectTrigger><SelectValue placeholder={t.auth.selectDomain} /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100]">
              {currentDomains.map((d) => (
                <SelectItem key={d.name} value={d.name}>{fr ? d.name_fr : d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        <Label>{t.auth.bio}</Label>
        <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
          placeholder={fr ? 'Parlez-nous de vous et de votre art...' : 'Tell us about yourself and your art...'} />
      </div>

      <div className="space-y-2">
        <Label>{t.auth.additionalInfo}</Label>
        <Textarea name="additional_info" value={formData.additional_info} onChange={handleChange} rows={2}
          placeholder={fr ? 'Expositions, prix, collaborations notables...' : 'Exhibitions, awards, notable collaborations...'} />
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
        {isLoading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{fr ? 'Création...' : 'Creating...'}</>
          : t.auth.register}
      </Button>
    </form>
  );
}

function InstitutionForm({ onSuccess }) {
  const { language, t } = useLanguageStore();
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

  const fr = language === 'fr';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-2xl border border-border/50">
      {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <div className="space-y-2">
        <Label>{fr ? "Nom de l'organisation *" : 'Organization Name *'}</Label>
        <Input name="organization_name" value={formData.organization_name} onChange={handleChange}
          placeholder={fr ? 'Ex: Ministère de la Culture du Sénégal' : 'Ex: Ministry of Culture of Senegal'} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{fr ? 'Prénom du contact *' : 'Contact First Name *'}</Label>
          <Input name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>{fr ? 'Nom du contact *' : 'Contact Last Name *'}</Label>
          <Input name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.email} *</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} required
            placeholder={fr ? 'contact@organisation.org' : 'contact@organization.org'} />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.password} *</Label>
          <Input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
        </div>
      </div>

      {/* ✅ Same Portal-backed SelectContent with value || undefined guard */}
      <div className="space-y-2">
        <Label>{t.auth.country} *</Label>
        <Select value={formData.country || undefined} onValueChange={handleCountryChange}>
          <SelectTrigger><SelectValue placeholder={t.auth.selectCountry} /></SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
            {countries.map((c) => (
              <SelectItem key={c.name} value={c.name}>{fr ? c.name_fr : c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.subregion && (
        <div className="p-3 bg-secondary/50 rounded-lg text-sm">
          <span className="text-muted-foreground">{t.auth.subregion}: </span>
          <span className="font-medium">
            {fr ? countries.find(c => c.name === formData.country)?.subregion_fr : formData.subregion}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label>{fr ? "Mission / Description de l'organisation" : 'Mission / Organization Description'}</Label>
        <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
          placeholder={fr ? "Décrivez la mission de votre organisation..." : "Describe your organization's mission..."} />
      </div>

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm space-y-1">
        <p className="font-semibold text-primary">{fr ? '📊 Accès aux statistiques' : '📊 Statistics Access'}</p>
        <p className="text-muted-foreground">
          {fr
            ? "Après inscription, vous devrez effectuer un paiement fictif pour obtenir votre code d'accès et consulter les statistiques détaillées."
            : "After registration, you will need to complete a mock payment to receive your access code and view detailed statistics."}
        </p>
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
        {isLoading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{fr ? 'Création...' : 'Creating...'}</>
          : (fr ? 'Créer le compte Institution' : 'Create Institution Account')}
      </Button>
    </form>
  );
}

export default function Register() {
  const { language, t } = useLanguageStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('artist');
  const fr = language === 'fr';

  const handleSuccess = (role) => {
    if (role === 'institution') navigate('/checkout');
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
            {fr ? 'Rejoignez Art Connect Africa' : 'Join Art Connect Africa'}
          </h1>
          <p className="text-muted-foreground">{fr ? 'Choisissez votre type de compte' : 'Choose your account type'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { key: 'artist', icon: Palette, label: fr ? 'Artiste' : 'Artist', sub: fr ? 'Portfolio & Réseau' : 'Portfolio & Network' },
            { key: 'institution', icon: Building2, label: fr ? 'Institution' : 'Institution', sub: fr ? 'Accès aux statistiques' : 'Statistics Access' },
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
          ) : (
            <motion.div key="institution" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <InstitutionForm onSuccess={handleSuccess} />
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
