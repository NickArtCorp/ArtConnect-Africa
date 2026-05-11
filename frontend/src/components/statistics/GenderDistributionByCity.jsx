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
import { useStatisticsStore } from '@/store';

const GENDER_COLORS = {
  female: '#EC4899',
  male: '#3B82F6',
};

/**
 * GenderDistributionByCity Component
 * Displays gender distribution across cities in a country
 * Allows selecting a specific city for drill-down
 */
export default function GenderDistributionByCity({ country }) {
  const { countryStats, cityStats, isLoadingV2, errorV2, fetchCountryStats, fetchCityStats } = useStatisticsStore();
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    if (country) {
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
  
  // Set selected city to first city if not set
  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0].city);
    }
  }, [cities, selectedCity]);

  if (!country) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Select a country to view city data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingV2 && !cityStats) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading city data...</span>
        </CardContent>
      </Card>
    );
  }

  if (errorV2) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">Error: {errorV2}</span>
        </CardContent>
      </Card>
    );
  }

  // Prepare gender data for chart
  const genderChartData = cityStats && cityStats.overview
    ? Object.entries(cityStats.overview.by_gender || {}).map(([gender, count]) => ({
        name: gender === 'Male' ? 'Hommes' : gender === 'Female' ? 'Femmes' : gender,
        count,
        gender: gender.toLowerCase()
      }))
    : [];

  // Sectors data
  const sectorData = (cityStats?.by_sector || []).slice(0, 8).map(s => ({
    name: s.sector || 'Unknown',
    artists: s.artist_count,
    engagement: s.engagement || 0
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution by City</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* City Selector */}
          <div>
            <label className="text-sm font-medium">Select City</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Choose a city..." />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.city} value={city.city}>
                    {city.city || 'Unknown'} ({city.artist_count} artists)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cityStats && (
            <>
              {/* City Overview */}
              <div className="border-t pt-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold">{cityStats.overview?.total_artists || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Artists</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{cityStats.overview?.total_messages || 0}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{cityStats.overview?.total_views || 0}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>

              {/* Gender Distribution Chart */}
              <div>
                <h4 className="text-sm font-medium mb-3">Gender Distribution</h4>
                {genderChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={genderChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Count">
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
                  <p className="text-center text-muted-foreground text-sm">No gender data available</p>
                )}
              </div>

              {/* Sectors in City */}
              {sectorData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Top Sectors in {selectedCity}</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sectorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="artists" fill="#7C3AED" name="Artists" />
                      <Bar dataKey="engagement" fill="#10B981" name="Engagement" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Domains */}
              {cityStats.by_domain && cityStats.by_domain.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Popular Domains</h4>
                  <div className="flex flex-wrap gap-2">
                    {cityStats.by_domain.slice(0, 8).map((domain) => (
                      <div
                        key={domain.domain}
                        className="px-2 py-1 bg-muted rounded text-xs"
                      >
                        <span className="font-medium">{domain.domain}</span>
                        <span className="text-muted-foreground ml-1">({domain.artist_count})</span>
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
