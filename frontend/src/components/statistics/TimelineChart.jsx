import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useStatisticsStore } from '@/store';

const COLORS = {
  new_artists: '#7C3AED',
  posts: '#3B82F6',
  collaborations: '#10B981',
  engagement: '#F59E0B'
};

/**
 * TimelineChart Component
 * Shows monthly evolution of artists, posts, collaborations, and engagement
 * Allows selecting the number of months to display
 */
export default function TimelineChart({ country }) {
  const { timelineData, isLoadingV2, errorV2, fetchTimeline } = useStatisticsStore();
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
          <p className="text-muted-foreground text-center">Select a country to view timeline</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingV2) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading timeline data...</span>
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Monthly Activity Timeline</CardTitle>
          <div className="flex gap-2">
            {[3, 6, 12, 24].map((m) => (
              <Badge
                key={m}
                variant={months === m ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setMonths(m)}
              >
                {m}M
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Artists & Posts */}
          <div>
            <h4 className="text-sm font-medium mb-2">New Artists & Posts</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="new_artists"
                  stroke={COLORS.new_artists}
                  name="New Artists"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke={COLORS.posts}
                  name="Posts"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Collaborations & Engagement */}
          <div>
            <h4 className="text-sm font-medium mb-2">Collaborations & Engagement</h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timelineData?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="collaborations"
                  stackId="1"
                  stroke={COLORS.collaborations}
                  fill={COLORS.collaborations}
                  name="Collaborations"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stackId="1"
                  stroke={COLORS.engagement}
                  fill={COLORS.engagement}
                  name="Engagement Views"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border rounded p-3">
              <p className="text-xs text-muted-foreground">Total New Artists</p>
              <p className="text-lg font-bold">
                {(timelineData?.timeline || []).reduce((sum, t) => sum + (t.new_artists || 0), 0)}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-xs text-muted-foreground">Total Posts</p>
              <p className="text-lg font-bold">
                {(timelineData?.timeline || []).reduce((sum, t) => sum + (t.posts || 0), 0)}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-xs text-muted-foreground">Total Collaborations</p>
              <p className="text-lg font-bold">
                {(timelineData?.timeline || []).reduce((sum, t) => sum + (t.collaborations || 0), 0)}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-xs text-muted-foreground">Total Engagement</p>
              <p className="text-lg font-bold">
                {(timelineData?.timeline || []).reduce((sum, t) => sum + (t.engagement || 0), 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
