import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, MessageCircle, Eye, TrendingUp, MapPin, Zap, Loader2 
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart
} from 'recharts';
import { useStatisticsStore, useLanguageStore } from '@/store';

const COLORS = {
  female: '#EC4899',
  male: '#3B82F6',
  primary: '#7C3AED',
  green: '#10B981',
  orange: '#F59E0B'
};

export default function CountryStatsOverview({ country }) {
  const { countryStats, isLoadingV2, errorV2, fetchCountryStats } = useStatisticsStore();
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (country) {
      fetchCountryStats(country);
    }
  }, [country, fetchCountryStats]);

  if (!country) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">{t.statistics.selectCountry}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingV2) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t.statistics.loadingV2}</span>
        </CardContent>
      </Card>
    );
  }

  if (errorV2) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-500">{t.statistics.error}: {errorV2}</p>
        </CardContent>
      </Card>
    );
  }

  if (!countryStats) return null;

  const { overview, by_city, by_sector, by_domain, top_artists, subregion } = countryStats;

  const genderData = Object.entries(overview.by_gender || {}).map(([key, value]) => ({
    name: key === 'Male' ? t.statistics.men : key === 'Female' ? t.statistics.women : key,
    value,
    fill: key === 'Male' ? COLORS.male : COLORS.female
  }));

  const cityData = by_city.slice(0, 10).map(item => ({
    city: item.city || 'Unknown',
    artists: item.artist_count
  }));

  const sectorData = by_sector.slice(0, 8).map(item => ({
    sector: item.sector || 'Unknown',
    artists: item.artist_count
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{country} {t.statistics.dashboard}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                <MapPin className="inline h-3 w-3 mr-1" />
                {subregion}
              </p>
            </div>
            {countryStats?.cached && (
              <Badge variant="outline">{t.statistics.cachedData}</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.statistics.totalArtists}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_artists}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.statistics.totalPosts}</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_posts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.statistics.totalCollaborations}</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.collaborations.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.statistics.totalEngagement}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_views + overview.total_messages}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t.statistics.overview}</TabsTrigger>
          <TabsTrigger value="cities">{t.statistics.citiesTab}</TabsTrigger>
          <TabsTrigger value="sectors">{t.statistics.sectorsTab}</TabsTrigger>
          <TabsTrigger value="topArtists">{t.statistics.topArtistsTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.statistics.genderDistribution}</CardTitle>
            </CardHeader>
            <CardContent>
              {genderData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground">{t.statistics.noData}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.statistics.collaborationTypes}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t.statistics.localCollabs}</span>
                  <Badge>{overview.collaborations.local}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t.statistics.intraAfricanCollabs}</span>
                  <Badge variant="secondary">{overview.collaborations.intra_african}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.statistics.artistsByCity}</CardTitle>
            </CardHeader>
            <CardContent>
              {cityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="artists" fill={COLORS.primary} name={t.statistics.artists} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground">{t.statistics.noCityData}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.statistics.artistsBySector}</CardTitle>
            </CardHeader>
            <CardContent>
              {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="sector" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="artists" fill={COLORS.primary} name={t.statistics.artists} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground">{t.statistics.noSectorData}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topArtists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.statistics.topArtistsByEngagement}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {top_artists && top_artists.length > 0 ? (
                  top_artists.map((artist, idx) => (
                    <div key={artist.artist_id} className="border rounded p-3 hover:bg-muted/50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">#{idx + 1}</span>
                            <span className="font-medium">{artist.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {artist.sector} · {artist.domain}
                          </p>
                        </div>
                        <Badge>{artist.engagement_score} {t.statistics.pts}</Badge>
                      </div>
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        <span>👁️ {artist.views}</span>
                        <span>💬 {artist.messages}</span>
                        <span>❤️ {artist.likes}</span>
                        <span>🤝 {artist.collaborations}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">{t.statistics.noArtistsData}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
