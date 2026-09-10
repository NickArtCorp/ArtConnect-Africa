import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Loader2, AlertCircle, Briefcase, Users, Tv } from 'lucide-react';
import { useStatisticsStore } from '@/store';

const COLORS = {
  artists: '#7C3AED',
  professionals: '#10B981',
  media: '#3B82F6',
};

/**
 * SectorComparison Component
 * Compares domains/fields within a country by Artistes, Professionnels, and Médias count
 */
export default function SectorComparison({ country }) {
  const { sectorStats, isLoadingSector, errorSector, fetchSectorStats } = useStatisticsStore();

  useEffect(() => {
    if (country) {
      fetchSectorStats(country, 'all');
    }
  }, [country, fetchSectorStats]);

  if (!country) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Sélectionnez un pays pour afficher les domaines</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingSector) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement des domaines...</span>
        </CardContent>
      </Card>
    );
  }

  if (errorSector) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">Erreur: {errorSector}</span>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for visualization
  const sectors = sectorStats?.by_sector || [];
  const chartData = sectors.slice(0, 3).map((s) => ({
    name: s.sector || s.domain || 'Général',
    artists: s.artist_count || 0,
    professionals: s.professional_count || 0,
    media: s.media_count || 0,
    engagement: s.engagement || 0
  }));

  // Radar data (for top 3)
  const radarData = sectors.slice(0, 3).map(s => ({
    subject: s.sector || s.domain || 'Général',
    Artistes: s.artist_count || 0,
    Professionnels: s.professional_count || 0,
  }));

  const totalArtists = sectors.reduce((sum, s) => sum + (s.artist_count || 0), 0);
  const totalPros = sectors.reduce((sum, s) => sum + (s.professional_count || 0), 0);
  const totalMedia = sectors.reduce((sum, s) => sum + (s.media_count || 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Domaine & Métier - {country}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bar Chart comparing Artists, Professionals, Media */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Nombre d'Artistes, Professionnels et Médias par domaine</h4>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="artists" name="Artistes" fill={COLORS.artists} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="professionals" name="Professionnels" fill={COLORS.professionals} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="media" name="Médias" fill={COLORS.media} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">Aucune donnée disponible</p>
            )}
          </div>

          {/* Radar Chart comparing Top 3 Fields */}
          {radarData.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Comparaison des Top 3 Domaines (Artistes vs Pros)</h4>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                  <Radar
                    name="Artistes"
                    dataKey="Artistes"
                    stroke={COLORS.artists}
                    fill={COLORS.artists}
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Professionnels"
                    dataKey="Professionnels"
                    stroke={COLORS.professionals}
                    fill={COLORS.professionals}
                    fillOpacity={0.5}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Table */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Détail par domaine</h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {sectors.length > 0 ? (
                sectors.map((sector, idx) => {
                  const artCount = sector.artist_count || 0;
                  const proCount = sector.professional_count || 0;
                  const medCount = sector.media_count || 0;

                  return (
                    <div
                      key={sector.sector || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{sector.sector || 'Général'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs gap-1 border-purple-300 text-purple-700 bg-purple-50">
                          <Users className="h-3 w-3" />
                          {artCount} artistes
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1 border-emerald-300 text-emerald-700 bg-emerald-50">
                          <Briefcase className="h-3 w-3" />
                          {proCount} pros
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1 border-blue-300 text-blue-700 bg-blue-50">
                          <Tv className="h-3 w-3" />
                          {medCount} médias
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground text-sm">Aucune donnée de domaine</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t flex flex-wrap justify-between items-center text-sm gap-2">
            <span className="font-semibold text-muted-foreground">Totaux par catégorie dans les domaines :</span>
            <div className="flex gap-2">
              <Badge variant="default" className="bg-purple-600">{totalArtists} Artistes</Badge>
              <Badge variant="default" className="bg-emerald-600">{totalPros} Professionnels</Badge>
              <Badge variant="default" className="bg-blue-600">{totalMedia} Médias</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
