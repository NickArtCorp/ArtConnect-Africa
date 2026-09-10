import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store';

/**
 * CountrySelector Component
 * Displays a dropdown to select African countries with artist counts
 * Fetches available countries from the API
 */
export default function CountrySelector({ value, onChange }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuthStore();
  const isOrgOrPartner = user && (user.role === 'partenaire' || user.role === 'personne_morale' || user.account_type === 'partner' || (user.role === 'visitor' && user.visitor_type === 'organisation'));

  useEffect(() => {
    if (isOrgOrPartner && user?.country && value !== user.country) {
      onChange(user.country);
    }
  }, [isOrgOrPartner, user, value, onChange]);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
  try {
    setLoading(true);
    setError(null);

    // Align with the rest of the app: API base comes from REACT_APP_BACKEND_URL if set, else /api
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const isLocalhostEnv = backendUrl && (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1'));
    const isBrowserOnLocalhost = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
    const useBackendUrl = backendUrl && backendUrl !== 'undefined' && (!isLocalhostEnv || isBrowserOnLocalhost);
    const API = useBackendUrl ? `${backendUrl}/api` : '/api';
    const url = `${API}/statistics/v2/countries-list`;

    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      validateStatus: () => true, // we handle errors ourselves
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to fetch countries (HTTP ${response.status})`);
    }

    if (typeof response.data === 'string') {
      // Most common cause: frontend/dev server returned index.html (SPA fallback) or an HTML error page.
      console.error('Received non-JSON response:', response.data.slice(0, 500));
      throw new Error('Server returned HTML instead of JSON. Check API route.');
    }

    const fetchedCountries = Array.isArray(response.data) ? response.data : (response.data?.countries || []);
    setCountries(fetchedCountries);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Select Country
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading countries...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Select Country
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange} disabled={isOrgOrPartner && user?.country}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a country..." />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {countries.map((country) => {
              const name = typeof country === 'string' ? country : country.name;
              const count = typeof country === 'object' ? country.artist_count : null;
              return (
                <SelectItem key={name} value={name}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{name}</span>
                    {count !== null && count !== undefined && (
                      <Badge variant="secondary" className="ml-2">
                        {count} artistes
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {isOrgOrPartner && user?.country && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>Pays verrouillé à votre organisation : <strong className="text-foreground">{user.country}</strong></span>
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500 mt-2">Error: {error}</p>
        )}
      </CardContent>
    </Card>
  );
}
