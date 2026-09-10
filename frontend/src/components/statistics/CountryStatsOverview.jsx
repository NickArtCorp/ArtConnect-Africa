import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Eye, TrendingUp, MapPin, Zap, Loader2, Briefcase, Tv
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useStatisticsStore, useLanguageStore } from '@/store';

const COLORS = {
  female: '#EC4899',
  male: '#3B82F6',
  primary: '#7C3AED',
  green: '#10B981',
  orange: '#F59E0B'
};

/**
 * CountryStatsOverview Component
 * Displays comprehensive statistics for a selected country
 * Includes: overview cards, gender distribution, city breakdown
 */
export default function CountryStatsOverview({ country }) {
  const { countryStats, isLoadingCountry, errorCountry, fetchCountryStats } = useStatisticsStore();
  const { t } = useLanguageStore();

  useEffect(() => {
    if (country) {
      fetchCountryStats(country);
    }
  }, [country, fetchCountryStats]);

  if (!country) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">{t.common.all}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingCountry) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t.common.loading}</span>
        </CardContent>
      </Card>
    );
  }

  if (errorCountry) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-500">Error: {errorCountry}</p>
        </CardContent>
      </Card>
    );
  }

  if (!countryStats) return null;

  const {
    overview = {},
    by_city = [],
    by_sector = [],
    by_domain = [],
    top_artists = [],
    subregion = ''
  } = countryStats;

  // Prepare data for charts
  const genderData = Object.entries(overview?.by_gender || {}).map(([key, value]) => ({
    name: key === 'Male' ? (t.statistics?.men || 'Hommes') : key === 'Female' ? (t.statistics?.women || 'Femmes') : key,
    value,
    fill: key === 'Male' ? COLORS.male : COLORS.female
  }));

  const cityData = (by_city || []).slice(0, 3).map(item => ({
    city: item.city || 'Unknown',
    artists: item.artist_count || 0,
    pros: item.professional_count || 0,
    media: item.media_count || 0
  }));

  const sectorData = (by_sector || []).slice(0, 3).map(item => ({
    sector: item.sector || 'Unknown',
    artists: item.artist_count || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header with country info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{country} Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                <MapPin className="inline h-3 w-3 mr-1" />
                {subregion}
              </p>
            </div>
            {countryStats?.cached && (
              <Badge variant="outline">Cached Data</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Artistes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_artists || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Professionnels</CardTitle>
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_professionals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Médias</CardTitle>
            <Tv className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_media || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_posts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Collaborations</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.collaborations?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Engagement Total</CardTitle>
            <Eye className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overview.total_views || 0) + (overview.total_messages || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.statistics?.genderSplit || 'Répartition par Genre'}</CardTitle>
          </CardHeader>
          <CardContent>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">Aucune donnée de genre disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Profiles by City Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profils et Médias par Ville</CardTitle>
          </CardHeader>
          <CardContent>
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="artists" fill={COLORS.primary} name="Artistes" />
                  <Bar dataKey="pros" fill="#10B981" name="Professionnels" />
                  <Bar dataKey="media" fill="#3B82F6" name="Médias" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">Aucune donnée de ville disponible</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
