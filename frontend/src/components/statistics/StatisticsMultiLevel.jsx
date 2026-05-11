import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Globe } from 'lucide-react';
import { useStatisticsStore } from '@/store';

// Import all sub-components
import CountrySelector from './CountrySelector';
import CountryStatsOverview from './CountryStatsOverview';
import TimelineChart from './TimelineChart';
import SectorComparison from './SectorComparison';
import GenderDistributionByCity from './GenderDistributionByCity';
import DrilldownTable from './DrilldownTable';
import StatisticsExplorer from './StatisticsExplorer';

/**
 * StatisticsMultiLevel Component
 * Master component for the multi-level statistics dashboard
 * Integrates all sub-components for country-level analytics
 */
export default function StatisticsMultiLevel() {
  const { countryStats } = useStatisticsStore();
  const [selectedCountry, setSelectedCountry] = useState('');

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Geographic Insights</h1>
          <p className="text-sm text-muted-foreground">
            Simple, drill-down statistics (global → country → city → métier → domaine).
          </p>
        </div>
      </div>

      <Tabs defaultValue="explorer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="explorer">Explorer</TabsTrigger>
          <TabsTrigger value="country">Country dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="space-y-4">
          <StatisticsExplorer />
        </TabsContent>

        <TabsContent value="country" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CountrySelector value={selectedCountry} onChange={handleCountryChange} />
            </div>
            {!selectedCountry && (
              <Card className="lg:col-span-2 border-dashed">
                <CardContent className="pt-10 pb-10 text-center">
                  <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Choisis un pays pour voir le dashboard détaillé.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {selectedCountry && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="sectors">Sectors</TabsTrigger>
                <TabsTrigger value="cities">Cities</TabsTrigger>
                <TabsTrigger value="artists">Artists</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <CountryStatsOverview country={selectedCountry} />
              </TabsContent>
              <TabsContent value="timeline" className="space-y-4">
                <TimelineChart country={selectedCountry} />
              </TabsContent>
              <TabsContent value="sectors" className="space-y-4">
                <SectorComparison country={selectedCountry} />
              </TabsContent>
              <TabsContent value="cities" className="space-y-4">
                <GenderDistributionByCity country={selectedCountry} />
              </TabsContent>
              <TabsContent value="artists" className="space-y-4">
                <DrilldownTable country={selectedCountry} />
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
