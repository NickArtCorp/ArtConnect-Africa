import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPartnerCreate() {
  const { t } = useLanguageStore();
  const { token } = useAuthStore();
  const { countries, sectors, domains, genders, fetchReferenceData } = useReferenceStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    organization_name: '',
    country: '',
    city: '',
    gender: '',
    sector: '',
    domain: '',
    bio: '',
    website: '',
    additional_info: '',
    profile_tag: '',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCountryChange = (value) => {
    const country = countries.find((c) => c.name === value);
    setFormData((prev) => ({
      ...prev,
      country: value,
      city: country?.subregion || '',
    }));
  };

  const validateForm = () => {
    const requiredFields = ['first_name', 'last_name', 'email', 'password', 'organization_name', 'country', 'gender', 'sector', 'domain'];
    const missing = requiredFields.filter((field) => !formData[field]);

    if (missing.length > 0) {
      setError(`${t.auth?.missingFields || 'Missing required fields'}: ${missing.join(', ')}`);
      return false;
    }

    if (formData.password.length < 6) {
      setError(t.auth?.passwordTooShort || 'Password must be at least 6 characters');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError(t.auth?.invalidEmail || 'Invalid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        role: 'partenaire',
      };

      const response = await fetch(`${API_BASE_URL}/admin/create-partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create partner');
      }

      const data = await response.json();
      setGeneratedCode(data.partner_code);
      setSuccess(true);
      setSuccessMessage(`Partner ${formData.first_name} ${formData.last_name} created successfully!`);

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        organization_name: '',
        country: '',
        city: '',
        gender: '',
        sector: '',
        domain: '',
        bio: '',
        website: '',
        additional_info: '',
        profile_tag: '',
      });

      // Auto-redirect to admin panel after 3 seconds
      setTimeout(() => {
        navigate('/admin/approvals');
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred while creating the partner');
      console.error('Error creating partner:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl border border-border p-8 space-y-6 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold mb-2">{successMessage}</h2>
            <p className="text-muted-foreground mb-4">
              {t.auth?.partnerCodeGenerated || 'Partner code has been generated and sent via email'}
            </p>
            <div className="bg-secondary p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-1">
                {t.auth?.partnerCode || 'Partner Code'}:
              </p>
              <p className="text-2xl font-mono font-bold text-primary">{generatedCode}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t.auth?.codeSharedViaEmail || 'Code has been shared via email'}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {t.auth?.redirectingToAdmin || 'Redirecting to admin panel in 3 seconds...'}
            </p>
            <Button onClick={() => navigate('/admin/approvals')} className="w-full rounded-full">
              {t.auth?.backToAdmin || 'Back to Admin Panel'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/approvals')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.auth?.backToAdmin || 'Back to Admin'}
          </button>
          <h1 className="text-3xl font-bold mb-2">{t.auth?.createPartnerAccount || 'Create Partner Account'}</h1>
          <p className="text-muted-foreground">
            {t.auth?.createPartnerDesc || 'Create a new partner account manually. The partner will receive their unique access code via email.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border/50">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.auth?.basicInfo || 'Basic Information'}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.auth?.firstName} *</Label>
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t.auth?.lastName} *</Label>
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.auth?.organizationName} *</Label>
              <Input
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                placeholder="Partner Organization"
                required
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.auth?.contactInfo || 'Contact Information'}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.auth?.email} *</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="partner@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t.auth?.password} *</Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.auth?.website || 'Website'}</Label>
              <Input
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.auth?.location || 'Location'}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.auth?.country} *</Label>
                <Select value={formData.country} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.auth?.selectCountry} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
                    {countries.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.auth?.city || 'City'}</Label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t.auth?.city || 'City'}
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.auth?.professionalInfo || 'Professional Information'}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t.auth?.gender} *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.auth?.selectGender} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="z-[100]">
                    {Array.isArray(genders) && genders.map((g) => {
                      const label = typeof g === 'string' ? g : (g?.name || String(g));
                      return (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.auth?.sector} *</Label>
                <Select value={formData.sector} onValueChange={(value) => handleSelectChange('sector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.auth?.selectSector} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
                    {Array.isArray(sectors) && sectors.map((s) => {
                      const label = typeof s === 'string' ? s : (s?.name || String(s));
                      return (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.auth?.domain} *</Label>
                <Select value={formData.domain} onValueChange={(value) => handleSelectChange('domain', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.auth?.selectDomain} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="z-[100] max-h-60">
                    {Array.isArray(domains) && domains.map((d) => {
                      const label = typeof d === 'string' ? d : (d?.name || String(d));
                      return (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.auth?.additionalInfo || 'Additional Information'}</h3>

            <div className="space-y-2">
              <Label>{t.auth?.bio || 'Bio'}</Label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder={t.auth?.tellAboutPartner || 'Tell us about this partner...'}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.auth?.additionalDetails || 'Additional Details'}</Label>
              <Textarea
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                placeholder={t.auth?.additionalDetailsPlaceholder || 'Any additional information...'}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.auth?.profileTag || 'Profile Tag'}</Label>
              <Input
                name="profile_tag"
                value={formData.profile_tag}
                onChange={handleChange}
                placeholder="e.g., Featured, Verified, Trusted"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => navigate('/admin/approvals')}
            >
              {t.auth?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" className="flex-1 rounded-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.auth?.creating || 'Creating...'}
                </>
              ) : (
                t.auth?.createPartner || 'Create Partner'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
