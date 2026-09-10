import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Globe } from 'lucide-react';
import { useStatisticsStore, useLanguageStore, useAuthStore } from '@/store';

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
export default function StatisticsMultiLevel({ initialRegion, initialCountry }) {
  const { countryStats } = useStatisticsStore();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const isOrgOrPartner = user && (user.role === 'partenaire' || user.role === 'personne_morale' || user.account_type === 'partner' || (user.role === 'visitor' && user.visitor_type === 'organisation'));
  const defaultCountry = initialCountry || (isOrgOrPartner && user?.country ? user.country : '');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const [activeTab, setActiveTab] = useState(defaultCountry ? 'country' : 'explorer');

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    if (country) setActiveTab('country');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t.statistics.geographic}</h1>
          <p className="text-sm text-muted-foreground">
            {t.statistics.geographicDesc || 'Simple, drill-down statistics (global → country → city → métier → domaine).'}
          </p>
          {initialRegion && (
            <Badge variant="secondary" className="mt-1">{t.statistics.region}: {initialRegion}</Badge>
          )}
        </div>
      </div>

      {isOrgOrPartner && user?.country && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-3 text-sm text-primary">
          <Globe className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Tableau de bord ministériel et institutionnel</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vos statistiques affichent exclusivement les données officielles relatives à votre pays d'accréditation : <span className="font-bold text-foreground">{user.country}</span>.
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="explorer">{t.statistics.explorer || 'Explorer'}</TabsTrigger>
          <TabsTrigger value="country">{t.statistics.countryAnalysis || 'Country Analysis'}</TabsTrigger>
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
                <TabsTrigger value="overview">{t.statistics?.overview || 'Aperçu'}</TabsTrigger>
                <TabsTrigger value="timeline">{t.statistics?.statsTimeline || 'Chronologie'}</TabsTrigger>
                <TabsTrigger value="sectors">{t.statistics?.bySector || 'Domaines'}</TabsTrigger>
                <TabsTrigger value="cities">{t.statistics?.cities || 'Villes'}</TabsTrigger>
                <TabsTrigger value="artists">{t.statistics?.members || 'Membres'}</TabsTrigger>
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
