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
import axios from 'axios';

const apiUrlEnv = process.env.REACT_APP_API_URL;
const isLocalhostEnv = apiUrlEnv && (apiUrlEnv.includes('localhost') || apiUrlEnv.includes('127.0.0.1'));
const isBrowserOnLocalhost = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
const useApiUrl = apiUrlEnv && apiUrlEnv !== 'undefined' && (!isLocalhostEnv || isBrowserOnLocalhost);
const API_URL = useApiUrl ? apiUrlEnv : '';

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
    email: '',
    password: '',
    organization_name: '',
    country: '',
    city: '',
    subregion: '',
    bio: '',
    website: '',
    additional_info: '',
    first_name: '',
    last_name: '',
  });

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

  const handleCountryChange = (value) => {
    const country = countries.find((c) => c.name === value);
    setFormData((prev) => ({
      ...prev,
      country: value,
      subregion: country?.subregion || '',
    }));
  };

  const validateForm = () => {
    const requiredFields = ['email', 'password', 'organization_name', 'country', 'subregion'];
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

      const response = await axios.post(`${API_URL}/api/admin/create-partner`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data;
      setGeneratedCode(data.partner_code);
      setSuccess(true);
      setSuccessMessage(`${t.auth.partner} ${formData.organization_name} ${t.common.success}!`);

      // Reset form
      setFormData({
        email: '',
        password: '',
        organization_name: '',
        country: '',
        city: '',
        subregion: '',
        bio: '',
        website: '',
        additional_info: '',
        first_name: '',
        last_name: '',
      });
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'An error occurred while creating the partner';
      setError(message);
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
              {t.auth?.copyCodeInstruction || 'Veuillez copier ce code avant de quitter cette page.'}
            </p>
            <Button onClick={() => navigate('/admin/institutions')} className="w-full rounded-full">
              {t.admin?.institutions || 'Gérer les Institutions'}
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
            onClick={() => navigate('/admin/institutions')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.admin?.institutions || 'Gérer les Institutions'}
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

            <div className="space-y-2">
              <Label>{t.auth?.organizationName} *</Label>
              <Input
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                placeholder={t.auth?.orgNamePlaceholder}
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
                        {t.common?.isFrench ? (c.name_fr || c.name) : c.name}
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

          {/* Presentation Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.auth?.presentationOrg}</h3>

            <div className="space-y-2">
              <Label>{t.auth?.presentationOrg}</Label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder={t.auth?.missionPlaceholder}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.auth?.additionalInfo || 'Additional Details'}</Label>
              <Textarea
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                placeholder={t.auth?.additionalInfoPlaceholder}
                rows={2}
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
