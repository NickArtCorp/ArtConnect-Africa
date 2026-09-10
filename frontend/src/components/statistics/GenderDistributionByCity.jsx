import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import { useStatisticsStore, useLanguageStore } from '@/store';

const GENDER_COLORS = {
  female: '#EC4899',
  male: '#3B82F6',
};

/**
 * GenderDistributionByCity Component
 * Displays gender distribution and domain engagement levels across cities
 */
export default function GenderDistributionByCity({ country }) {
  const { countryStats, cityStats, isLoadingCountry, errorCountry, isLoadingCity, errorCity, fetchCountryStats, fetchCityStats } = useStatisticsStore();
  const { t } = useLanguageStore();
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    if (country) {
      setSelectedCity('');
      fetchCountryStats(country);
    }
  }, [country, fetchCountryStats]);

  useEffect(() => {
    if (selectedCity && country) {
      fetchCityStats(country, selectedCity);
    }
  }, [selectedCity, country, fetchCityStats]);

  // Get available cities
  const cities = countryStats?.by_city || [];
  
  // Set selected city to first city if not set or invalid for current country
  useEffect(() => {
    if (cities.length > 0) {
      const cityNames = cities.map(c => typeof c === 'string' ? c : (c.city || c.name)).filter(Boolean);
      if (cityNames.length > 0 && (!selectedCity || !cityNames.includes(selectedCity))) {
        setSelectedCity(cityNames[0]);
      }
    }
  }, [cities, selectedCity]);

  if (!country) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Sélectionnez un pays pour afficher les données des villes</p>
        </CardContent>
      </Card>
    );
  }

  if ((isLoadingCountry || isLoadingCity) && !cityStats) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t.common.loading}</span>
        </CardContent>
      </Card>
    );
  }

  if (errorCountry || errorCity) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">Erreur: {errorCountry || errorCity}</span>
        </CardContent>
      </Card>
    );
  }

  // Prepare gender data for chart
  const genderChartData = cityStats && cityStats.overview
    ? Object.entries(cityStats.overview.by_gender || {}).map(([gender, count]) => ({
        name: gender === 'Male' ? (t.statistics.men || 'Hommes') : gender === 'Female' ? (t.statistics.women || 'Femmes') : gender,
        count,
        gender: gender.toLowerCase()
      }))
    : [];

  // Sectors/Domains engagement data (capped at top 3)
  const sectorEngagementData = (cityStats?.by_sector || cityStats?.by_domain || []).slice(0, 3).map(s => ({
    name: s.sector || s.domain || 'Général',
    engagement: s.engagement || 0
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Analyse par Ville & Engagement - {country}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* City Selector */}
          <div>
            <label className="text-sm font-medium">Sélectionner une ville</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Choisir une ville..." />
              </SelectTrigger>
              <SelectContent>
                {cities.map((cityObj, idx) => {
                  const cityName = typeof cityObj === 'string' ? cityObj : (cityObj.city || cityObj.name || `Ville ${idx+1}`);
                  const artCount = typeof cityObj === 'object' ? (cityObj.artist_count ?? 0) : null;
                  const proCount = typeof cityObj === 'object' ? (cityObj.professional_count ?? 0) : null;
                  const medCount = typeof cityObj === 'object' ? (cityObj.media_count ?? 0) : null;
                  
                  return (
                    <SelectItem key={cityName || idx} value={cityName}>
                      {cityName} {artCount !== null ? `(${artCount} artistes, ${proCount} pros, ${medCount} médias)` : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {cityStats && (
            <>
              {/* City Overview with Artistes, Pros, Médias */}
              <div className="border rounded-lg p-4 bg-muted/20 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center border-r last:border-r-0 pr-2">
                  <p className="text-2xl font-bold text-primary">{cityStats.overview?.total_artists || 0}</p>
                  <p className="text-xs text-muted-foreground font-medium">Artistes Totaux</p>
                </div>
                <div className="text-center border-r last:border-r-0 pr-2">
                  <p className="text-2xl font-bold text-emerald-600">{cityStats.overview?.total_professionals || 0}</p>
                  <p className="text-xs text-muted-foreground font-medium">Professionnels Totaux</p>
                </div>
                <div className="text-center border-r last:border-r-0 pr-2">
                  <p className="text-2xl font-bold text-blue-600">{cityStats.overview?.total_media || 0}</p>
                  <p className="text-xs text-muted-foreground font-medium">Médias Totaux</p>
                </div>
                <div className="text-center border-r last:border-r-0 pr-2">
                  <p className="text-2xl font-bold">{cityStats.overview?.total_views || 0}</p>
                  <p className="text-xs text-muted-foreground font-medium">Vues</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{cityStats.overview?.total_messages || 0}</p>
                  <p className="text-xs text-muted-foreground font-medium">Messages</p>
                </div>
              </div>

              {/* Engagement Level in Domain (Focus on Engagement, Artists bar removed) */}
              {sectorEngagementData.length > 0 && (
                <div className="pt-2">
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold">Niveau d'engagement dans les domaines / métiers à {selectedCity}</h4>
                    <p className="text-xs text-muted-foreground">Mesure de l'interaction et de l'intérêt généré par domaine</p>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={sectorEngagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="engagement" fill="#10B981" name="Niveau d'Engagement" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Gender Distribution Chart */}
              <div className="pt-2">
                <h4 className="text-sm font-semibold mb-3">Répartition par Genre à {selectedCity}</h4>
                {genderChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={genderChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Nombre" radius={[4, 4, 0, 0]}>
                        {genderChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.gender === 'male' ? GENDER_COLORS.male : GENDER_COLORS.female}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground text-sm">Aucune donnée de genre disponible</p>
                )}
              </div>

              {/* Domains in City */}
              {cityStats?.by_domain?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Domaines d'activité à {selectedCity}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {(cityStats.by_domain || []).map((domain) => (
                      <div
                        key={domain.domain}
                        className="p-2 border rounded-md bg-muted/30 text-xs"
                      >
                        <span className="font-semibold block truncate">{domain.domain}</span>
                        <div className="text-muted-foreground mt-1 flex justify-between">
                          <span>{domain.artist_count || 0} art.</span>
                          <span>{domain.professional_count || 0} pro</span>
                          <span>{domain.media_count || 0} méd.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
