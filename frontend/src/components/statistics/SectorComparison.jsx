import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import { useStatisticsStore } from '@/store';

const COLORS = {
  primary: '#7C3AED',
  blue: '#3B82F6',
  green: '#10B981',
  orange: '#F59E0B',
  pink: '#EC4899'
};

const COLOR_ARRAY = [
  COLORS.blue,
  COLORS.primary,
  COLORS.green,
  COLORS.orange,
  COLORS.pink
];

/**
 * SectorComparison Component
 * Compares sectors within a country by artist count and engagement
 * Displays both bar chart and sector distribution
 */
export default function SectorComparison({ country }) {
  const { sectorStats, isLoadingV2, errorV2, fetchSectorStats } = useStatisticsStore();
  const [selectedSector, setSelectedSector] = useState(null);

  useEffect(() => {
    if (country) {
      fetchSectorStats(country, 'all');
    }
  }, [country, fetchSectorStats]);

  if (!country) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Select a country to view sector data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingV2) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading sector data...</span>
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

  // Prepare data for visualization
  const sectors = sectorStats?.by_sector || [];
  const chartData = sectors.slice(0, 10).map((s, idx) => ({
    ...s,
    name: s.sector || 'Unknown',
    artists: s.artist_count,
    fill: COLOR_ARRAY[idx % COLOR_ARRAY.length]
  }));

  // Radar data (for top 5)
  const radarData = sectors.slice(0, 5).map(s => ({
    subject: s.sector || 'Unknown',
    value: s.artist_count,
    fullMark: Math.max(...sectors.map(x => x.artist_count)) || 100
  }));

  const totalArtists = sectors.reduce((sum, s) => sum + (s.artist_count || 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sectors Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bar Chart */}
          <div>
            <h4 className="text-sm font-medium mb-3">Artists by Sector</h4>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="artists" name="Artists">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">No data available</p>
            )}
          </div>

          {/* Radar Chart for Top 5 Sectors */}
          {radarData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Top 5 Sectors Comparison</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                  <Radar
                    name="Artists"
                    dataKey="value"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Table */}
          <div>
            <h4 className="text-sm font-medium mb-3">Detailed Breakdown</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sectors.length > 0 ? (
                sectors.map((sector, idx) => {
                  const percentage = totalArtists > 0 
                    ? Math.round((sector.artist_count / totalArtists) * 100) 
                    : 0;
                  return (
                    <div
                      key={sector.sector || idx}
                      className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sector.sector || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-32 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLOR_ARRAY[idx % COLOR_ARRAY.length]
                            }}
                          />
                        </div>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {sector.artist_count} ({percentage}%)
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground text-sm">No sector data</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t flex justify-between items-center">
            <span className="font-medium">Total Artists in Sectors:</span>
            <Badge variant="default" className="text-base">{totalArtists}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
