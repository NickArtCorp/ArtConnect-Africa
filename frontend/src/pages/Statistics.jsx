import { useEffect } from 'react';
import { useStatisticsStore, useLanguageStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Globe, BarChart3, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Statistics() {
  const { overview, detailed, fetchOverview, fetchDetailed, hasInstitutionAccess, isLoading } = useStatisticsStore();
  const { user } = useAuthStore();
  const { language, t } = useLanguageStore();

  useEffect(() => {
    fetchOverview();
    if (user) {
      fetchDetailed();
    }
  }, [fetchOverview, fetchDetailed, user]);

  const isInstitution = user?.role === 'institution' || user?.role === 'admin';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            {language === 'fr' ? 'Données' : 'Data'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2 mb-4">
            {t.statistics.title}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {language === 'fr' 
              ? 'Explorez les données démographiques de la communauté artistique africaine'
              : 'Explore demographic data of the African artistic community'}
          </p>
        </motion.div>

        {isLoading && !overview ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <p className="text-3xl font-bold">{overview?.total_artists || 0}</p>
                  <p className="text-sm text-muted-foreground">{t.statistics.totalArtists}</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <Globe className="w-8 h-8 text-accent mb-2" />
                  <p className="text-3xl font-bold">{Object.keys(overview?.by_subregion || {}).length}</p>
                  <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Régions' : 'Regions'}</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <BarChart3 className="w-8 h-8 text-primary mb-2" />
                  <p className="text-3xl font-bold">{Object.keys(overview?.by_sector || {}).length}</p>
                  <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Secteurs' : 'Sectors'}</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 text-accent mb-2" />
                  <p className="text-3xl font-bold">{overview?.total_projects || 0}</p>
                  <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Projets' : 'Projects'}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Public Stats - By Region & Sector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* By Subregion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      {t.statistics.byRegion}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(overview?.by_subregion || {}).map(([region, count]) => (
                        <div key={region} className="flex items-center justify-between">
                          <span className="text-sm">{region}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(count / (overview?.total_artists || 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* By Sector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-accent" />
                      {t.statistics.bySector}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(overview?.by_sector || {}).slice(0, 8).map(([sector, count]) => (
                        <div key={sector} className="flex items-center justify-between">
                          <span className="text-sm truncate max-w-[150px]">{sector}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent rounded-full transition-all"
                                style={{ width: `${(count / (overview?.total_artists || 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Detailed Stats - Institution Only */}
            {isInstitution && detailed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {t.statistics.byGender}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(detailed.by_gender || {}).map(([gender, count]) => (
                        <div key={gender} className="text-center p-4 bg-secondary/30 rounded-xl">
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-sm text-muted-foreground">{gender}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      {t.statistics.byCountry}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Object.entries(detailed.by_country || {}).slice(0, 12).map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <span className="text-sm truncate">{country}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* Institution Access CTA */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                  <CardContent className="py-12 text-center">
                    <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{t.statistics.detailedStats}</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {language === 'fr' 
                        ? 'Accédez aux statistiques détaillées par genre, pays et plus encore. Réservé aux institutions et organisations.'
                        : 'Access detailed statistics by gender, country and more. Reserved for institutions and organizations.'}
                    </p>
                    <Button asChild className="rounded-full px-8">
                      <a href="/institution-access">
                        {t.statistics.requestAccess}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
