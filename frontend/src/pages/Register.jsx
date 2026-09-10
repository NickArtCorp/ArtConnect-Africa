import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, Building2, Users, CheckCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function PersonnePhysiqueForm({ onSuccess }) {
  const { t } = useLanguageStore();
  const { countries, domains, metiers, genders, fetchReferenceData } = useReferenceStore();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '',
    country: '', country_origin: '', diaspora_country: '', custom_diaspora_country: '', city: '', subregion: '', gender: '', domain: '', profession: '',
    bio: '', additional_info: '', role: 'personne_physique',
    profile_tag: 'artist', reference_person_name: '', reference_person_email: '',
    phone: '', address: '', website: ''
  });

  const bioLimit = 3000;
  const bioWarningAt = 2800;

  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  const handleChange = (e) => {
    const value = (e.target.name === 'email' || e.target.name === 'reference_person_email') 
      ? e.target.value.toLowerCase() 
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCountryChange = (value) => {
    const country = countries.find(c => c.name === value);
    setFormData({ ...formData, country: value, subregion: country?.subregion || '' });
  };

  const handleDomainChange = (value) =>
    setFormData({ ...formData, domain: value, profession: '' });

  const handleProfileTagChange = (value) => {
    setFormData({ ...formData, profile_tag: value, domain: '', profession: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalDiasporaCountry = formData.country === 'Diaspora' 
      ? (formData.diaspora_country === 'Autre' ? formData.custom_diaspora_country : formData.diaspora_country)
      : '';
    const cleanedData = { 
      ...formData,
      diaspora_country: finalDiasporaCountry
    };
    const result = await register(cleanedData);
    if (result.success) onSuccess('personne_physique');
  };

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
          <Label>{t.auth.countryResidence || 'Pays de résidence'} *</Label>
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
          <Label>{t.auth.countryOrigin || "Pays d'origine"} *</Label>
          <Select value={formData.country_origin || undefined} onValueChange={(value) => setFormData({ ...formData, country_origin: value })}>
            <SelectTrigger><SelectValue placeholder={t.auth.selectCountryOrigin || "Sélectionnez le pays d'origine"} /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
              {countries.filter(c => c.name !== 'Diaspora').map((c) => (
                <SelectItem key={c.name} value={c.name}>{t.common.isFrench ? (c.name_fr || c.name) : c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.country === 'Diaspora' && (
        <div className="p-4 bg-secondary/30 border border-border/50 rounded-xl space-y-4">
          <div className="space-y-2">
            <Label>{t.auth.diasporaCountry || 'Pays étranger de résidence'} *</Label>
            <Select value={formData.diaspora_country || undefined} onValueChange={(v) => setFormData({ ...formData, diaspora_country: v })}>
              <SelectTrigger><SelectValue placeholder={t.common.isFrench ? "Sélectionnez le pays étranger" : "Select foreign country"} /></SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
                {["France", "Belgique", "Canada", "États-Unis", "Royaume-Uni", "Allemagne", "Suisse", "Italie", "Espagne", "Autre"].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.diaspora_country === 'Autre' && (
            <div className="space-y-2">
              <Label>{t.common.isFrench ? "Saisissez le nom du pays" : "Enter country name"} *</Label>
              <Input 
                name="custom_diaspora_country" 
                value={formData.custom_diaspora_country || ''} 
                onChange={(e) => setFormData({ ...formData, custom_diaspora_country: e.target.value })} 
                placeholder="Ex: Luxembourg"
                required
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label>{t.auth.city} *</Label>
          <Input name="city" value={formData.city} onChange={handleChange} placeholder={t.auth.city} required />
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
          <Label>Domaine *</Label>
          <Select value={formData.domain || undefined} onValueChange={handleDomainChange}>
            <SelectTrigger><SelectValue placeholder="Sélectionnez un domaine" /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100]">
              {domains.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Métier *</Label>
          <Select
            value={formData.profession || undefined}
            onValueChange={(v) => setFormData({ ...formData, profession: v })}
            disabled={!formData.domain}
          >
            <SelectTrigger><SelectValue placeholder="Sélectionnez un métier" /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100]">
              {(metiers[formData.domain] || []).map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Métier *</Label>
        <Select
          value={formData.profession || undefined}
          onValueChange={(v) => setFormData({ ...formData, profession: v })}
          disabled={!formData.domain}
        >
          <SelectTrigger><SelectValue placeholder="Sélectionnez un métier" /></SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-[100]">
            {(metiers[formData.domain] || []).map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.profileTag} *</Label>
        <Select 
          value={formData.profile_tag} 
          onValueChange={handleProfileTagChange}
          required
        >
          <SelectTrigger><SelectValue placeholder={t.auth.profileTag} /></SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-[100]">
            <SelectItem value="artist">{t.auth.artistTag}</SelectItem>
            <SelectItem value="professional">{t.auth.professionalTag}</SelectItem>
            <SelectItem value="media">{t.auth.mediaTag}</SelectItem>
          </SelectContent>
        </Select>
        {formData.profile_tag === 'professional' && (
          <p className="text-xs text-muted-foreground mt-1">✓ {t.auth.canChooseMultidisciplinary || 'You can choose multidisciplinary'}</p>
        )}
        {(formData.profile_tag === 'artist' || formData.profile_tag === 'media') && (
          <p className="text-xs text-muted-foreground mt-1">ℹ️ {t.auth.chooseSingleDomain || 'Choose only one domain'}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>{formData.profile_tag === 'artist' ? t.auth.biographyArtist : t.auth.presentationIndividual}</Label>
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
          placeholder={formData.profile_tag === 'artist' ? t.auth.bioPlaceholder : (t.auth.presentationIndividual + '...')} 
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.phone}</Label>
          <Input name="phone" type="tel" value={formData.phone} onChange={handleChange}
            placeholder="+1 (555) 000-0000" />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.website}</Label>
          <Input name="website" type="url" value={formData.website} onChange={handleChange}
            placeholder="https://..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.address}</Label>
        <Textarea name="address" value={formData.address} onChange={handleChange} rows={2}
          placeholder={t.auth.addressPlaceholder} />
      </div>

      <div className="p-4 bg-secondary/50 border border-secondary/30 rounded-xl text-sm space-y-4">
        <p className="text-muted-foreground font-medium">{t.auth.contactPersonInfo}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.auth.contactPersonName}</Label>
            <Input name="reference_person_name" value={formData.reference_person_name} onChange={handleChange} 
              placeholder="Ex: Jean Dupont" />
          </div>
          <div className="space-y-2">
            <Label>{t.auth.contactPersonEmail}</Label>
            <Input name="reference_person_email" type="email" value={formData.reference_person_email} onChange={handleChange}
              placeholder="contact@example.com" />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
        {isLoading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.auth.creating}</>
          : t.auth.register}
      </Button>
    </form>
  );
}

function PersonneMoraleForm({ onSuccess }) {
  const { t } = useLanguageStore();
  const { countries, fetchReferenceData } = useReferenceStore();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '', password: '',
    organization_name: '', country: '', country_origin: '', diaspora_country: '', custom_diaspora_country: '', city: '', subregion: '',
    gender: 'Male', sector: 'Arts & Culture', domain: 'Institution',
    bio: '', role: 'personne_morale',
    profile_tag: 'professional',
    reference_person_name: '', reference_person_email: '', employees_count: '',
    phone: '', address: '', website: ''
  });

  const wordLimit = 500;

  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  const handleChange = (e) => {
    const value = (e.target.name === 'email' || e.target.name === 'reference_person_email') 
      ? e.target.value.toLowerCase() 
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCountryChange = (value) => {
    const country = countries.find(c => c.name === value);
    setFormData({ ...formData, country: value, subregion: country?.subregion || '' });
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (getWordCount(formData.bio) > wordLimit) {
      return; // Should be blocked by UI but just in case
    }
    const finalDiasporaCountry = formData.country === 'Diaspora' 
      ? (formData.diaspora_country === 'Autre' ? formData.custom_diaspora_country : formData.diaspora_country)
      : '';
    const cleanedData = { 
      ...formData,
      diaspora_country: finalDiasporaCountry,
      reference_person_email: formData.reference_person_email || null,
      reference_person_name: formData.reference_person_name || null,
      employees_count: formData.employees_count ? parseInt(formData.employees_count) : null
    };
    const result = await register(cleanedData);
    if (result.success) onSuccess('personne_morale');
  };

  const currentWordCount = getWordCount(formData.bio);

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
        <Label>{t.auth.employeeCount}</Label>
        <Input name="employees_count" type="number" value={formData.employees_count} onChange={handleChange}
          placeholder="e.g., 50" min="1" />
      </div>

      <div className="space-y-2">
        <Label>{t.auth.profileTag} *</Label>
        <Select 
          value={formData.profile_tag} 
          onValueChange={(value) => setFormData({ ...formData, profile_tag: value })}
          required
        >
          <SelectTrigger><SelectValue placeholder={t.auth.profileTag} /></SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-[100]">
            <SelectItem value="professional">{t.auth.professionalTag}</SelectItem>
            <SelectItem value="media">{t.auth.mediaTag}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.countryResidence || 'Pays d\'établissement/résidence'} *</Label>
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
          <Label>{t.auth.countryOrigin || "Pays d'origine/fondation"} *</Label>
          <Select value={formData.country_origin || undefined} onValueChange={(value) => setFormData({ ...formData, country_origin: value })}>
            <SelectTrigger><SelectValue placeholder={t.auth.selectCountryOrigin || "Sélectionnez le pays d'origine"} /></SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
              {countries.filter(c => c.name !== 'Diaspora').map((c) => (
                <SelectItem key={c.name} value={c.name}>{t.common.isFrench ? (c.name_fr || c.name) : c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.country === 'Diaspora' && (
        <div className="p-4 bg-secondary/30 border border-border/50 rounded-xl space-y-4">
          <div className="space-y-2">
            <Label>{t.auth.diasporaCountry || 'Pays étranger de résidence'} *</Label>
            <Select value={formData.diaspora_country || undefined} onValueChange={(v) => setFormData({ ...formData, diaspora_country: v })}>
              <SelectTrigger><SelectValue placeholder={t.common.isFrench ? "Sélectionnez le pays étranger" : "Select foreign country"} /></SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
                {["France", "Belgique", "Canada", "États-Unis", "Royaume-Uni", "Allemagne", "Suisse", "Italie", "Espagne", "Autre"].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.diaspora_country === 'Autre' && (
            <div className="space-y-2">
              <Label>{t.common.isFrench ? "Saisissez le nom du pays" : "Enter country name"} *</Label>
              <Input 
                name="custom_diaspora_country" 
                value={formData.custom_diaspora_country || ''} 
                onChange={(e) => setFormData({ ...formData, custom_diaspora_country: e.target.value })} 
                placeholder="Ex: Luxembourg"
                required
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>{t.auth.city} *</Label>
        <Input name="city" value={formData.city} onChange={handleChange} placeholder={t.auth.city} required />
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
        <div className="flex justify-between items-center">
          <Label>{t.auth.presentationOrg}</Label>
          <span className={`text-xs font-medium ${currentWordCount > wordLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {currentWordCount} / {wordLimit} mots
          </span>
        </div>
        <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
          placeholder={t.auth.missionPlaceholder} />
        {currentWordCount > wordLimit && (
          <p className="text-xs text-destructive">La présentation ne peut pas dépasser {wordLimit} mots.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.auth.phone}</Label>
          <Input name="phone" type="tel" value={formData.phone} onChange={handleChange}
            placeholder="+1 (555) 000-0000" />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.website}</Label>
          <Input name="website" type="url" value={formData.website} onChange={handleChange}
            placeholder="https://..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.address}</Label>
        <Textarea name="address" value={formData.address} onChange={handleChange} rows={2}
          placeholder={t.auth.addressPlaceholder} />
      </div>

      <div className="p-4 bg-secondary/50 border border-secondary/30 rounded-xl text-sm space-y-4">
        <p className="text-muted-foreground font-medium">{t.auth.contactPersonInfo}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.auth.contactPersonName}</Label>
            <Input name="reference_person_name" value={formData.reference_person_name} onChange={handleChange} 
              placeholder="Ex: Jean Dupont" />
          </div>
          <div className="space-y-2">
            <Label>{t.auth.contactPersonEmail}</Label>
            <Input name="reference_person_email" type="email" value={formData.reference_person_email} onChange={handleChange}
              placeholder="contact@example.com" />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={isLoading || currentWordCount > wordLimit}>
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
    country: '', diaspora_country: '', custom_diaspora_country: '', city: '', subregion: '',
    gender: null, sector: null, domain: null,
    visitor_type: 'individual',
    organization_name: '',
    role: 'visitor',
    bio: '',
    phone: '', address: '', website: ''
  });

  const wordLimit = 500;

  useEffect(() => { fetchReferenceData(); }, [fetchReferenceData]);

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleChange = (e) => {
    const value = (e.target.name === 'email' || e.target.name === 'reference_person_email') 
      ? e.target.value.toLowerCase() 
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCountryChange = (value) => {
    const country = countries.find(c => c.name === value);
    setFormData({ ...formData, country: value, subregion: country?.subregion || '' });
  };

  const handleVisitorTypeChange = (value) => {
    setFormData({ ...formData, visitor_type: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.visitor_type === 'organisation' && getWordCount(formData.bio) > wordLimit) {
      return;
    }
    const finalDiasporaCountry = formData.country === 'Diaspora' 
      ? (formData.diaspora_country === 'Autre' ? formData.custom_diaspora_country : formData.diaspora_country)
      : '';
    const cleanedData = { 
      ...formData,
      diaspora_country: finalDiasporaCountry,
      reference_person_email: formData.reference_person_email || null,
      reference_person_name: formData.reference_person_name || null
    };
    const result = await register(cleanedData);
    if (result.success) onSuccess('visitor');
  };

  const currentWordCount = getWordCount(formData.bio);

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

      {formData.visitor_type === 'individual' && (
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
      )}

      {formData.visitor_type === 'organisation' && (
        <>
          <div className="space-y-2">
            <Label>{t.auth.organisationName} *</Label>
            <Input name="organization_name" value={formData.organization_name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>{t.auth.presentationOrg}</Label>
              <span className={`text-xs font-medium ${currentWordCount > wordLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {currentWordCount} / {wordLimit} mots
              </span>
            </div>
            <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
              placeholder={t.auth.missionPlaceholder} />
            {currentWordCount > wordLimit && (
              <p className="text-xs text-destructive">La présentation ne peut pas dépasser {wordLimit} mots.</p>
            )}
          </div>
        </>
      )}

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

      <div className="space-y-2">
        <Label>{t.auth.countryResidence || t.auth.country} *</Label>
        <Select value={formData.country || undefined} onValueChange={handleCountryChange}>
          <SelectTrigger><SelectValue placeholder={t.auth.selectCountry} /></SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
            {countries.map((c) => (
              <SelectItem key={c.name} value={c.name}>{t.common.isFrench ? (c.name_fr || c.name) : c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.country === 'Diaspora' && (
        <div className="p-4 bg-secondary/30 border border-border/50 rounded-xl space-y-4">
          <div className="space-y-2">
            <Label>{t.auth.diasporaCountry || 'Pays étranger de résidence'} *</Label>
            <Select value={formData.diaspora_country || undefined} onValueChange={(v) => setFormData({ ...formData, diaspora_country: v })}>
              <SelectTrigger><SelectValue placeholder={t.common.isFrench ? "Sélectionnez le pays étranger" : "Select foreign country"} /></SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
                {["France", "Belgique", "Canada", "États-Unis", "Royaume-Uni", "Allemagne", "Suisse", "Italie", "Espagne", "Autre"].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.diaspora_country === 'Autre' && (
            <div className="space-y-2">
              <Label>{t.common.isFrench ? "Saisissez le nom du pays" : "Enter country name"} *</Label>
              <Input 
                name="custom_diaspora_country" 
                value={formData.custom_diaspora_country || ''} 
                onChange={(e) => setFormData({ ...formData, custom_diaspora_country: e.target.value })} 
                placeholder="Ex: Luxembourg"
                required
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>{t.auth.city} *</Label>
        <Input name="city" value={formData.city} onChange={handleChange} placeholder={t.auth.city} required />
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
          <Label>{t.auth.phone}</Label>
          <Input name="phone" type="tel" value={formData.phone} onChange={handleChange}
            placeholder="+1 (555) 000-0000" />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.website}</Label>
          <Input name="website" type="url" value={formData.website} onChange={handleChange}
            placeholder="https://..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.auth.address}</Label>
        <Textarea name="address" value={formData.address} onChange={handleChange} rows={2}
          placeholder={t.auth.addressPlaceholder} />
      </div>

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
  const [tab, setTab] = useState('personne_physique');
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const handleSuccess = (role) => {
    // Show pending approval modal instead of redirecting immediately
    setPendingUser({ role });
    setShowPendingApproval(true);
  };

  const handleContinueToLogin = () => {
    navigate('/login');
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
            { key: 'personne_physique', icon: Palette, label: t.auth.personnePhysique, sub: t.auth.portfolioNetwork },
            { key: 'personne_morale', icon: Building2, label: t.auth.personneMorale, sub: t.auth.portfolioNetwork },
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
          {!showPendingApproval ? (
            <>
              {tab === 'personne_physique' ? (
                <motion.div key="personne_physique" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <PersonnePhysiqueForm onSuccess={handleSuccess} />
                </motion.div>
              ) : tab === 'personne_morale' ? (
                <motion.div key="personne_morale" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <PersonneMoraleForm onSuccess={handleSuccess} />
                </motion.div>
              ) : (
                <motion.div key="visitor" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <VisitorForm onSuccess={handleSuccess} />
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-8 text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500/20 rounded-full"
                  />
                  <CheckCircle className="w-16 h-16 text-green-600 relative z-10" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t.auth.registrationSubmitted || 'Registration Submitted'}</h2>
                <p className="text-muted-foreground">
                  {t.auth.thankYouForRegistering || 'Thank you for registering on ArtConnect Africa'}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 space-y-2">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                      {t.auth.awaitingApproval || 'Awaiting Approval'}
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                      {t.auth.pendingApprovalMessage || 
                        'Your profile is being reviewed by our admin team. You will receive an email once your account has been approved. Please check your inbox and spam folder.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>✓ {t.auth.profileUnderReview || 'Your profile is under review'}</p>
                  <p>✓ {t.auth.checkEmailSoon || 'Check your email soon'}</p>
                  <p>✓ {t.auth.accessCodeWillBeSent || 'An access code will be sent once approved'}</p>
                </div>
              </div>

              <Button onClick={handleContinueToLogin} className="w-full rounded-full">
                {t.auth.continueToLogin || 'Continue to Login'}
              </Button>

              <p className="text-xs text-muted-foreground">
                {t.auth.havingIssues || 'Having issues?'}{' '}
                <Link to="/" className="text-primary hover:underline">
                  {t.auth.contactSupport || 'Contact support'}
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!showPendingApproval && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            {t.auth.alreadyAccount}{' '}
            <Link to="/login" className="text-primary hover:underline">{t.auth.signInHere}</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
