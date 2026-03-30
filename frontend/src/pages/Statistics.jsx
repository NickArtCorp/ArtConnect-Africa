import { useEffect } from 'react';
import { useStatisticsStore, useLanguageStore, useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Globe, BarChart3, TrendingUp, Heart, MessageCircle, ShieldCheck, Handshake, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = {
  primary: '#7C3AED',
  accent: '#06B6D4',
  pink: '#EC4899',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  green: '#10B981',
  orange: '#F59E0B'
};

const GENDER_COLORS = {
  Female: COLORS.pink,
  Male: COLORS.blue,
  Other: COLORS.purple,
  'Non-binary': COLORS.purple,
  'Prefer not to say': '#9CA3AF'
};

export default function Statistics() {
  const { overview, detailed, collaborations, fetchOverview, fetchDetailed, fetchCollaborationStats, isLoading } = useStatisticsStore();
  const { user } = useAuthStore();
  const { language, t } = useLanguageStore();
  const isAdmin = user?.role === 'admin';
  const fr = language === 'fr';

  useEffect(() => {
    fetchOverview();
    fetchDetailed();
    fetchCollaborationStats();
  }, [fetchOverview, fetchDetailed, fetchCollaborationStats]);

  // === PRÉPARATION DES DONNÉES POUR RECHARTS ===
  
  // Genre - Pie Chart
  const genderPieData = Object.entries(detailed?.by_gender || {}).map(([gender, count]) => ({
    name: fr ? (gender === 'Female' ? 'Femmes' : gender === 'Male' ? 'Hommes' : gender) : gender,
    value: count,
    percentage: detailed?.gender_percentages?.[gender] || 0
  }));

  // Project Collaborations Stats
  const projCollabByStatus = collaborations?.by_status || { ongoing: 0, upcoming: 0, past: 0 };
  const projCollabByType = Object.entries(collaborations?.by_type || {}).map(([type, count]) => ({
    name: type === 'local' ? (fr ? 'Locales' : 'Local') 
        : type === 'intra_african' ? (fr ? 'Intra-Africaines' : 'Intra-African') 
        : (fr ? 'Internationales' : 'International'),
    value: count,
    fill: type === 'local' ? COLORS.green : type === 'intra_african' ? COLORS.primary : COLORS.blue
  }));

  // Partenariats par type - Pie Chart
  const partnershipPieData = Object.entries(detailed?.intra_african?.by_partnership_type || {}).map(([type, count], index) => ({
    name: fr 
      ? (type === 'cultural' ? 'Culturel' : type === 'commercial' ? 'Commercial' : type === 'education' ? 'Éducation' : type)
      : type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    fill: [COLORS.primary, COLORS.accent, COLORS.green, COLORS.orange, COLORS.pink][index % 5]
  }));

  // Top pays - Bar Chart
  const topCountriesData = Object.entries(detailed?.intra_african?.top_countries || {})
    .slice(0, 8)
    .map(([country, count]) => ({
      name: fr 
        ? (country === 'Nigeria' ? 'Nigéria' : country === 'South Africa' ? 'Afrique du Sud' 
           : country === 'Kenya' ? 'Kenya' : country === 'Senegal' ? 'Sénégal' : country)
        : country,
      value: count
    }));

  if (isLoading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            {fr ? 'DONNÉES' : 'DATA'}
          </span>
          <Badge variant="outline" className="text-xs">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {isAdmin ? 'Admin' : 'Institution'}
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {fr ? 'Dashboard Statistiques' : 'Statistics Dashboard'}
        </h1>
        <p className="text-muted-foreground max-w-xl">
          {fr
            ? 'Accès complet aux données démographiques, collaborations et partenariats intra-africains.'
            : 'Full access to demographics, collaborations and intra-African partnerships data.'}
        </p>
      </motion.div>

      {/* KPI CARDS */}
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
            <Handshake className="w-8 h-8 text-accent mb-2" />
            <p className="text-3xl font-bold">{detailed?.collaborations?.total || 0}</p>
            <p className="text-sm text-muted-foreground">{fr ? 'Collaborations' : 'Collaborations'}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <Globe className="w-8 h-8 text-primary mb-2" />
            <p className="text-3xl font-bold">{detailed?.intra_african?.total || 0}</p>
            <p className="text-sm text-muted-foreground">{fr ? 'Projets Intra-Africains' : 'Intra-African Projects'}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <TrendingUp className="w-8 h-8 text-accent mb-2" />
            <p className="text-3xl font-bold">{overview?.total_posts || 0}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* TABS DASHBOARD */}
      <Tabs defaultValue="collaborations" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="collaborations">
            <Handshake className="w-4 h-4 mr-2" />
            {fr ? 'Collaborations' : 'Collaborations'}
          </TabsTrigger>
          <TabsTrigger value="intra-african">
            <Globe className="w-4 h-4 mr-2" />
            {fr ? 'Partenariats Intra-Africains' : 'Intra-African'}
          </TabsTrigger>
          <TabsTrigger value="gender">
            <Users className="w-4 h-4 mr-2" />
            {fr ? 'Genre' : 'Gender'}
          </TabsTrigger>
          <TabsTrigger value="demographics">
            <BarChart3 className="w-4 h-4 mr-2" />
            {fr ? 'Démographie' : 'Demographics'}
          </TabsTrigger>
        </TabsList>

        {/* TAB: COLLABORATIONS */}
        <TabsContent value="collaborations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="stat-card border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-500">{t.projects.ongoing}</span>
                </div>
                <p className="text-3xl font-bold">{projCollabByStatus.ongoing}</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6">
                <span className="text-sm font-medium text-blue-500 mb-2 block">{t.projects.upcoming}</span>
                <p className="text-3xl font-bold">{projCollabByStatus.upcoming}</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-muted-foreground/20 bg-muted/50">
              <CardContent className="pt-6">
                <span className="text-sm font-medium text-muted-foreground mb-2 block">{t.projects.past}</span>
                <p className="text-3xl font-bold">{projCollabByStatus.past}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  {t.statistics.statsByType}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projCollabByType}
                      cx="50%" cy="50%" outerRadius={100}
                      dataKey="value" nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {projCollabByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  {t.statistics.statsTimeline}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={collaborations?.by_month || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  {t.statistics.statsTopCountries}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={collaborations?.by_country || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                    <YAxis dataKey="country" type="category" stroke="#9CA3AF" fontSize={11} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: INTRA-AFRICAN */}
        <TabsContent value="intra-african" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-accent" />
                  {fr ? 'Types de Partenariats' : 'Partnership Types'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={partnershipPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}`}
                    >
                      {partnershipPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  {fr ? 'Top Pays Impliqués' : 'Top Countries'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCountriesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: GENDER */}
        <TabsContent value="gender" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-pink-500" />
                  {fr ? 'Distribution par Genre' : 'Gender Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {genderPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name] || COLORS.primary} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{fr ? 'Statistiques par Genre' : 'Gender Statistics'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(detailed?.by_gender || {}).map(([gender, count]) => (
                  <div key={gender} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{fr ? (gender === 'Female' ? 'Femmes' : gender === 'Male' ? 'Hommes' : gender) : gender}</span>
                      <Badge>{count}</Badge>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${detailed?.gender_percentages?.[gender] || 0}%`,
                          backgroundColor: GENDER_COLORS[gender] || COLORS.primary
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {detailed?.gender_percentages?.[gender] || 0}%
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: DEMOGRAPHICS */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.bySector}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(overview?.by_sector || {}).map(([sector, count]) => (
                    <div key={sector} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[180px]">{sector}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.byRegion}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(overview?.by_subregion || {}).map(([region, count]) => (
                    <div key={region} className="flex items-center justify-between">
                      <span className="text-sm">{region}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{fr ? 'Activité de la Plateforme' : 'Platform Activity'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <BarChart3 className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold">{detailed?.activity?.total_posts || 0}</p>
                  <p className="text-sm text-muted-foreground">{fr ? 'Publications' : 'Posts'}</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Heart className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{detailed?.activity?.total_likes || 0}</p>
                  <p className="text-sm text-muted-foreground">{fr ? 'Likes' : 'Likes'}</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <MessageCircle className="w-10 h-10 text-accent mx-auto mb-2" />
                  <p className="text-3xl font-bold">{detailed?.activity?.total_comments || 0}</p>
                  <p className="text-sm text-muted-foreground">{fr ? 'Commentaires' : 'Comments'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}