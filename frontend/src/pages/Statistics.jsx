import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatisticsStore, useLanguageStore, useAuthStore } from '@/store';
import { useInstitutionStore } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Globe, BarChart3, Lock, TrendingUp, Heart, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Statistics() {
  const { overview, detailed, fetchOverview, fetchDetailed, isLoading } = useStatisticsStore();
  const { user } = useAuthStore();
  const { has_paid } = useInstitutionStore();
  const { language, t } = useLanguageStore();
  const navigate = useNavigate();

  const isInstitution = user?.role === 'institution';
  const isAdmin = user?.role === 'admin';
  // Institution must have paid. Admins always have access.
  const hasDetailedAccess = isAdmin || (isInstitution && has_paid);

  useEffect(() => {
    fetchOverview();
    if (hasDetailedAccess) {
      fetchDetailed();
    }
  }, [fetchOverview, fetchDetailed, hasDetailedAccess]);

  const genderTotal = detailed?.by_gender
    ? Object.values(detailed.by_gender).reduce((a, b) => a + b, 0)
    : 0;

  const getGenderPercent = (gender) => {
    if (!detailed?.by_gender || !genderTotal) return 0;
    return ((detailed.by_gender[gender] || 0) / genderTotal * 100).toFixed(1);
  };

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
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
              {language === 'fr' ? 'Données' : 'Data'}
            </span>
            {hasDetailedAccess && (
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {isAdmin ? 'Admin' : 'Institution'}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {hasDetailedAccess
              ? (language === 'fr' ? 'Dashboard Statistiques' : 'Statistics Dashboard')
              : t.statistics.title}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {hasDetailedAccess
              ? (language === 'fr'
                  ? 'Accès complet aux données démographiques et analytiques de la communauté artistique.'
                  : 'Full access to demographic and analytical data of the artistic community.')
              : (language === 'fr'
                  ? 'Explorez les données démographiques de la communauté artistique africaine'
                  : 'Explore demographic data of the African artistic community')}
          </p>
        </motion.div>

        {isLoading && !overview ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Overview Stats — visible to everyone */}
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
                  <p className="text-3xl font-bold">{overview?.total_posts || 0}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 text-accent mb-2" />
                  <p className="text-3xl font-bold">{overview?.total_interactions || 0}</p>
                  <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Interactions' : 'Interactions'}</p>
                </CardContent>
              </Card>
            </motion.div>

            {hasDetailedAccess ? (
              /* ── INSTITUTION / ADMIN DASHBOARD ── */
              <Tabs defaultValue="demographics" className="space-y-6">
                <TabsList className="bg-card border border-border/50">
                  <TabsTrigger value="demographics">
                    {language === 'fr' ? 'Démographie' : 'Demographics'}
                  </TabsTrigger>
                  <TabsTrigger value="geography">
                    {language === 'fr' ? 'Géographie' : 'Geography'}
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    {language === 'fr' ? 'Activité' : 'Activity'}
                  </TabsTrigger>
                </TabsList>

                {/* Demographics */}
                <TabsContent value="demographics" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          {t.statistics.byGender}
                        </CardTitle>
                        <CardDescription>
                          {language === 'fr' ? 'Répartition par genre des artistes' : 'Gender distribution of artists'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(detailed?.by_gender || {}).map(([gender, count]) => (
                            <div key={gender}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{gender}</span>
                                <span className="font-medium">{count} ({getGenderPercent(gender)}%)</span>
                              </div>
                              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    gender === 'Female' ? 'bg-pink-500' :
                                    gender === 'Male' ? 'bg-blue-500' : 'bg-purple-500'
                                  }`}
                                  style={{ width: `${getGenderPercent(gender)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-accent" />
                          {t.statistics.bySector}
                        </CardTitle>
                        <CardDescription>
                          {language === 'fr' ? 'Artistes par secteur artistique' : 'Artists by artistic sector'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(overview?.by_sector || {}).map(([sector, count]) => (
                            <div key={sector} className="flex items-center justify-between">
                              <span className="text-sm truncate max-w-[180px]">{sector}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent rounded-full"
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
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{language === 'fr' ? 'Genre par Sous-région' : 'Gender by Sub-region'}</CardTitle>
                      <CardDescription>
                        {language === 'fr' ? 'Distribution du genre par région africaine' : 'Gender distribution by African region'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {['North Africa', 'West Africa', 'Central Africa', 'East Africa', 'Southern Africa'].map((region) => {
                          const regionData = (detailed?.gender_by_subregion || []).filter(
                            item => item._id?.subregion === region
                          );
                          return (
                            <div key={region} className="bg-secondary/30 rounded-xl p-4">
                              <h4 className="font-medium text-sm mb-3">{region}</h4>
                              <div className="space-y-2">
                                {regionData.map((item) => (
                                  <div key={`${region}-${item._id?.gender}`} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{item._id?.gender}</span>
                                    <span className="font-medium">{item.count}</span>
                                  </div>
                                ))}
                                {regionData.length === 0 && (
                                  <p className="text-sm text-muted-foreground">-</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Geography */}
                <TabsContent value="geography" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
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

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-accent" />
                          {t.statistics.byCountry}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-80 overflow-y-auto">
                        <div className="space-y-2">
                          {Object.entries(detailed?.by_country || {}).map(([country, count]) => (
                            <div key={country} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                              <span className="text-sm">{country}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Activity */}
                <TabsContent value="activity" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <BarChart3 className="w-12 h-12 text-primary mx-auto mb-3" />
                        <p className="text-4xl font-bold">{detailed?.activity?.total_posts || 0}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'fr' ? 'Publications totales' : 'Total Posts'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-4xl font-bold">{detailed?.activity?.total_likes || 0}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'fr' ? 'Likes totaux' : 'Total Likes'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <MessageCircle className="w-12 h-12 text-accent mx-auto mb-3" />
                        <p className="text-4xl font-bold">{detailed?.activity?.total_comments || 0}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'fr' ? 'Commentaires totaux' : 'Total Comments'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{language === 'fr' ? 'Artistes par Domaine' : 'Artists by Domain'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(detailed?.by_domain || {}).slice(0, 12).map(([domain, count]) => (
                          <div key={domain} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm truncate">{domain}</span>
                            <Badge>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

            ) : (
              /* ── PUBLIC VIEW ── */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
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

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
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

                {/* CTA for non-institutions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                    <CardContent className="py-12 text-center">
                      <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">{t.statistics.detailedStats}</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {language === 'fr'
                          ? 'Accédez aux statistiques détaillées par genre, pays et plus encore. Réservé aux institutions gouvernementales et organisations culturelles.'
                          : 'Access detailed statistics by gender, country and more. Reserved for government institutions and cultural organizations.'}
                      </p>
                      <Button onClick={() => navigate('/register')} className="rounded-full px-8">
                        {language === 'fr' ? "S'inscrire comme Institution" : 'Register as Institution'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
