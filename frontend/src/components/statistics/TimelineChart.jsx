import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useStatisticsStore } from '@/store';

const COLORS = {
  new_artists: '#7C3AED',
  new_professionals: '#10B981',
  new_media: '#3B82F6',
  posts_artists: '#A855F7',
  posts_pros: '#34D399',
  posts_media: '#60A5FA',
  collaborations: '#F59E0B'
};

/**
 * TimelineChart Component
 * Shows monthly evolution of new artists, professionals, media, and posts per type
 */
export default function TimelineChart({ country }) {
  const { timelineData, isLoadingTimeline, errorTimeline, fetchTimeline } = useStatisticsStore();
  const [months, setMonths] = useState(12);

  useEffect(() => {
    if (country) {
      fetchTimeline(country, 'monthly');
    }
  }, [country, months, fetchTimeline]);

  if (!country) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Sélectionnez un pays pour afficher la chronologie</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingTimeline) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement de la chronologie...</span>
        </CardContent>
      </Card>
    );
  }

  if (errorTimeline) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">Erreur: {errorTimeline}</span>
        </CardContent>
      </Card>
    );
  }

  const rawTimeline = timelineData?.timeline || [];
  const displayData = rawTimeline.slice(-months);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Chronologie d'activité mensuelle - {country}</CardTitle>
          <div className="flex gap-2">
            {[3, 6, 12, 24].map((m) => (
              <Badge
                key={m}
                variant={months === m ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setMonths(m)}
              >
                {m} Mois
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Profiles Evolution */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Nouveaux Inscrits (Artistes, Pros & Médias)</h4>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="new_artists"
                  stroke={COLORS.new_artists}
                  name="Nouveaux Artistes"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="new_professionals"
                  stroke={COLORS.new_professionals}
                  name="Nouveaux Pros"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="new_media"
                  stroke={COLORS.new_media}
                  name="Nouveaux Médias"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Posts generated per type */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Posts publiés par type de compte</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="posts_artists" stackId="posts" name="Posts Artistes" fill={COLORS.posts_artists} />
                <Bar dataKey="posts_professionals" stackId="posts" name="Posts Pros" fill={COLORS.posts_pros} />
                <Bar dataKey="posts_media" stackId="posts" name="Posts Médias" fill={COLORS.posts_media} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="border rounded-lg p-3 bg-purple-50/50">
              <p className="text-xs text-muted-foreground font-medium">Tot. Nouveaux Artistes</p>
              <p className="text-xl font-bold text-purple-700">
                {displayData.reduce((sum, t) => sum + (t.new_artists || 0), 0)}
              </p>
            </div>
            <div className="border rounded-lg p-3 bg-emerald-50/50">
              <p className="text-xs text-muted-foreground font-medium">Tot. Nouveaux Pros</p>
              <p className="text-xl font-bold text-emerald-700">
                {displayData.reduce((sum, t) => sum + (t.new_professionals || 0), 0)}
              </p>
            </div>
            <div className="border rounded-lg p-3 bg-blue-50/50">
              <p className="text-xs text-muted-foreground font-medium">Tot. Nouveaux Médias</p>
              <p className="text-xl font-bold text-blue-700">
                {displayData.reduce((sum, t) => sum + (t.new_media || 0), 0)}
              </p>
            </div>
            <div className="border rounded-lg p-3 bg-amber-50/50">
              <p className="text-xs text-muted-foreground font-medium">Total Posts</p>
              <p className="text-xl font-bold text-amber-700">
                {displayData.reduce((sum, t) => sum + (t.posts || 0), 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
