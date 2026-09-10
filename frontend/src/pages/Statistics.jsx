import { useEffect, useState } from 'react';
import { useStatisticsStore, useLanguageStore, useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart3, Users, Globe, TrendingUp, Heart, MessageCircle,
  PieChart as PieChartIcon, Activity, Eye, ChevronRight,
  Menu, X, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import StatisticsMultiLevel from '@/components/statistics/StatisticsMultiLevel';
import CollaborationAnalysis from '@/components/statistics/CollaborationAnalysis';

const COLORS = {
  primary: '#CC551A', // Terracotta
  accent: '#248F4D',  // Green
  pink: '#BE185D',
  blue: '#0369A1',
  purple: '#7E22CE',
  green: '#15803D',
  orange: '#E5A542', // Gold
  amber: '#D97706'
};

const GENDER_COLORS = {
  women: COLORS.pink,
  men: COLORS.blue,
};

const STATUS_COLORS = {
  ongoing: COLORS.green,
  upcoming: COLORS.blue,
  past: COLORS.purple
};

export default function Statistics() {
  const { overview, detailed, collaborations, fetchOverview, fetchDetailed, fetchCollaborationStats, isLoading } = useStatisticsStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { region, country: urlCountry } = useParams();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (region) {
      setActiveSection('geographic');
    }
  }, [region]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [profileTagFilter, setProfileTagFilter] = useState('all');

  const isAdmin = user?.role === 'admin';

  const translateDomain = (name) => {
    if (!name) return 'N/A';
    const mapping = {
      'Visual Arts': t.statistics.visualArts,
      'Arts Visuels': t.statistics.visualArts,
      'Music': t.statistics.music,
      'Musique': t.statistics.music,
      'Cinema': t.statistics.cinema,
      'Cinéma': t.statistics.cinema,
      'Literature': t.statistics.literature,
      'Littérature': t.statistics.literature,
      'Performance': t.statistics.performance,
      'Arts du Spectacle': t.statistics.performance,
      'Fashion': t.statistics.fashion,
      'Mode': t.statistics.fashion,
      'Dance': t.common.langCode === 'fr' ? 'Danse' : 'Dance',
      'Danse': t.common.langCode === 'fr' ? 'Danse' : 'Dance',
      'Digital Art': t.common.langCode === 'fr' ? 'Art Numérique' : 'Digital Art',
      'Art Numérique': t.common.langCode === 'fr' ? 'Art Numérique' : 'Digital Art'
    };
    return mapping[name] || name;
  };

  const translateCountry = (name) => {
    const mapping = {
      'Morocco': t.statistics.morocco,
      'Algeria': t.statistics.algeria,
      'Tunisia': t.statistics.tunisia,
      'Libya': t.statistics.libya,
      'Egypt': t.statistics.egypt,
      'Nigeria': t.statistics.nigeria,
      'Senegal': t.statistics.senegal,
      "Cote d'Ivoire": t.statistics.coteDIvoire,
      'Ghana': t.statistics.ghana,
      'Mali': t.statistics.mali,
      'Cameroon': t.statistics.cameroon,
      'Gabon': t.statistics.gabon,
      'DRC': t.statistics.drc,
      'Congo': t.statistics.congo,
      'Chad': t.statistics.chad,
      'Kenya': t.statistics.kenya,
      'Ethiopia': t.statistics.ethiopia,
      'Uganda': t.statistics.uganda,
      'Rwanda': t.statistics.rwanda,
      'Tanzania': t.statistics.tanzania,
      'South Africa': t.statistics.southAfrica,
      'Angola': t.statistics.angola,
      'Zimbabwe': t.statistics.zimbabwe,
      'Namibia': t.statistics.namibia,
      'Botswana': t.statistics.botswana
    };
    return mapping[name] || name;
  };

  useEffect(() => {
    fetchOverview();
    fetchDetailed(sectorFilter === 'all' ? null : sectorFilter, profileTagFilter === 'all' ? null : profileTagFilter);
    fetchCollaborationStats();
  }, [fetchOverview, fetchDetailed, fetchCollaborationStats, sectorFilter, profileTagFilter]);

  // Sidebar sections
  const sections = [
    { id: 'overview', label: t.statistics.overview, icon: BarChart3 },
    { id: 'geographic', label: t.statistics.geographic, icon: Globe },
    { id: 'collaborations', label: t.statistics.collaborations, icon: Users },
    { id: 'genderDomain', label: t.statistics.genderDomain, icon: PieChartIcon },
    { id: 'visitors', label: t.statistics.visitors, icon: Eye },
    { id: 'postsActivity', label: t.statistics.postsActivity, icon: Activity }
  ];

  // Filter visitor data
  const filteredVisitorData = detailed?.by_country_gender_domain?.filter(item => {
    const matchesGender = genderFilter === 'all' || item.gender === genderFilter;
    const matchesCountry = countryFilter === 'all' || item.country === countryFilter;
    const matchesDomain = domainFilter === 'all' || item.domain === domainFilter;
    const matchesSector = sectorFilter === 'all' || item.sector === sectorFilter;
    const matchesProfile = profileTagFilter === 'all' ||
      (profileTagFilter === 'artist' && (item.artist_count || 0) > 0) ||
      (profileTagFilter === 'professional' && (item.professional_count || 0) > 0) ||
      (profileTagFilter === 'media' && (item.media_count || 0) > 0);

    return matchesGender && matchesCountry && matchesDomain && matchesSector && matchesProfile;
  }) || [];

  const filteredTotalArtists = filteredVisitorData.reduce((acc, curr) => acc + (curr.artist_count || 0), 0);
  const filteredTotalPros = filteredVisitorData.reduce((acc, curr) => acc + (curr.professional_count || 0), 0);
  const filteredTotalMedia = filteredVisitorData.reduce((acc, curr) => acc + (curr.media_count || 0), 0);
  const filteredTotalViews = filteredVisitorData.reduce((acc, curr) => acc + (curr.visitor_views_count || 0), 0);
  const filteredTotalMsgs = filteredVisitorData.reduce((acc, curr) => acc + (curr.visitor_messages_count || 0), 0);
  const filteredTotalMembers = filteredTotalArtists + filteredTotalPros + filteredTotalMedia;

  // Prepare chart data
  const genderPieData = Object.entries(detailed?.by_gender || {})
    .filter(([gender]) => ['women', 'men'].includes(gender))
    .map(([gender, count]) => ({
      name: gender === 'women' ? t.statistics.women : t.statistics.men,
      value: count,
      color: GENDER_COLORS[gender] || COLORS.blue
    }));

  const statusData = [
    { name: t.projects.ongoing, value: collaborations?.by_status?.ongoing || 0, color: STATUS_COLORS.ongoing },
    { name: t.projects.upcoming, value: collaborations?.by_status?.upcoming || 0, color: STATUS_COLORS.upcoming },
    { name: t.projects.past, value: collaborations?.by_status?.past || 0, color: STATUS_COLORS.past }
  ];

  const monthlyData = collaborations?.by_month?.map(month => ({
    month: month.month,
    local: month.local || 0,
    intra_african: month.intra_african || 0
  })) || [];

  const genderCollaborationData = collaborations?.by_gender ? [
    {
      type: t.statistics.local,
      women: collaborations.by_gender.local?.women || 0,
      men: collaborations.by_gender.local?.men || 0
    },
    {
      type: t.statistics.intraAfrican,
      women: collaborations.by_gender.intra_african?.women || 0,
      men: collaborations.by_gender.intra_african?.men || 0
    }
  ] : [];

  const topCountryPairs = (collaborations?.by_country_pair || []).slice(0, 3).map(pair => ({
    pair: `${pair.country_a} ↔ ${pair.country_b}`,
    total: pair.total,
    women: pair.women,
    men: pair.men
  }));

  const sectorDistributionData = (detailed?.by_sector || [
    { subject: 'Visual Arts', A: 120, fullMark: 150 },
    { subject: 'Music', A: 98, fullMark: 150 },
    { subject: 'Literature', A: 86, fullMark: 150 },
  ]).slice(0, 3).map(item => ({
    ...item,
    subject: translateDomain(item.subject)
  }));

  const visitorViewsData = filteredVisitorData
    .sort((a, b) => (b.visitor_views_count || 0) - (a.visitor_views_count || 0))
    .slice(0, 3)
    .map(item => ({
      name: `${translateCountry(item.country)} - ${item.gender === 'women' ? t.statistics.women : t.statistics.men} - ${translateDomain(item.domain)}`,
      views: item.visitor_views_count || 0,
      messages: item.visitor_messages_count || 0
    }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t.statistics.loading}</p>
        </div>
      </div>
    );
  }


  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.auth.artistTag}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_artists || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t.statistics.totalArtists}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.auth.professionalTag}</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_professionals || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t.auth.professionalTag}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.auth.mediaTag}</CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_media || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t.auth.mediaTag}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.statistics.collaborations}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_collaborations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t.statistics.totalCollaborations}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.statistics.postsActivity}</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_posts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t.feed.title}
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'geographic': {
        const isOrgOrPartner = user && (user.role === 'partenaire' || user.role === 'personne_morale' || user.account_type === 'partner' || (user.role === 'visitor' && user.visitor_type === 'organisation'));
        const effectiveInitialCountry = urlCountry || (isOrgOrPartner && user?.country ? user.country : undefined);
        return (
          <div className="space-y-6">
            <StatisticsMultiLevel initialRegion={region} initialCountry={effectiveInitialCountry} />
          </div>
        );
      }

      case 'collaborations':
        return (
          <div className="space-y-12">
            <div className="space-y-8">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{t.statistics.hierarchicalEcosystem}</h3>
                <p className="text-muted-foreground">{t.statistics.hierarchicalEcosystemDesc}</p>
              </div>

              {/* Tiered Visualization */}
              <div className="grid grid-cols-1 gap-6">
                {collaborations?.tiers?.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: COLORS.primary }}>
                      <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold">{t.common.langCode === 'fr' ? tier.label_fr : tier.label}</h4>
                            <Badge variant="outline" className="text-xs">{tier.percentage}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{t.common.langCode === 'fr' ? tier.description_fr : tier.description}</p>
                        </div>
                        <div className="flex items-center gap-8 min-w-[200px] justify-end">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.statistics.collaborations}</div>
                            <div className="text-3xl font-black">{tier.count}</div>
                          </div>
                          <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                            <div className="text-sm font-bold text-primary">{tier.percentage}%</div>
                          </div>
                        </div>
                      </div>
                      {/* Progress bar at bottom */}
                      <div className="h-1 w-full bg-muted">
                        <motion.div 
                          className="h-full bg-primary" 
                          initial={{ width: 0 }}
                          animate={{ width: `${tier.percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                        />
                      </div>
                    </Card>
                    
                    {index < (collaborations?.tiers?.length || 0) - 1 && (
                      <div className="flex justify-center my-2">
                        <div className="w-0.5 h-4 bg-muted-foreground/30" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Summary Chart */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>{t.statistics.collaborationVolumeByTier}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={collaborations?.tiers || []} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey={t.common.langCode === 'fr' ? 'label_fr' : 'label'} 
                        type="category" 
                        width={120}
                        fontSize={12}
                      />
                      <Tooltip />
                      <Bar 
                        dataKey="count" 
                        fill={COLORS.primary} 
                        radius={[0, 4, 4, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Legend for Africa Regions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="bg-primary/5 border-none">
                  <CardHeader>
                    <CardTitle className="text-sm">{t.statistics.strategicFocus}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {t.statistics.strategicFocusDesc}
                  </CardContent>
                </Card>
                <Card className="bg-accent/5 border-none">
                  <CardHeader>
                    <CardTitle className="text-sm">{t.statistics.regionalResilience}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {t.statistics.regionalResilienceDesc}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Matrix Section */}
            <div className="pt-8 border-t border-border/50">
              <CollaborationAnalysis />
            </div>
          </div>
        );

      case 'genderDomain':
        return (
          <div className="space-y-6">
            {/* Profile Tag Filter */}
            <div className="flex gap-2">
              <Select value={profileTagFilter} onValueChange={setProfileTagFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t.auth.profileTag} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.common.all}</SelectItem>
                  <SelectItem value="artist">{t.auth.artistTag}</SelectItem>
                  <SelectItem value="professional">{t.auth.professionalTag}</SelectItem>
                  <SelectItem value="media">{t.auth.mediaTag}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.genderSplit}</CardTitle>
              </CardHeader>
              <CardContent className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value, percent }) => `${name} : ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {genderPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender by Domain */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.genderByDomain}</CardTitle>
              </CardHeader>
              <CardContent className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={(detailed?.by_gender_domain || []).map(d => ({ ...d, domain: translateDomain(d.domain) }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="domain" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="women" fill={GENDER_COLORS.women} name={t.statistics.women} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="men" fill={GENDER_COLORS.men} name={t.statistics.men} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case 'visitors':
        return (
          <div className="space-y-6">
            {/* Visitor Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.statistics.visitorViews}</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailed?.total_visitor_views || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.statistics.visitorMessages}</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailed?.total_visitor_messages || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.statistics.mostMessaged}</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{translateDomain(detailed?.most_messaged_domain) || 'N/A'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filterable Table "Aperçu Détaillé" */}
            <Card>
              <CardHeader className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{t.statistics.detailedData || "Aperçu Détaillé"}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Analyse détaillée par Pays, Ville, Domaine, Métier, Profil et Genre</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={profileTagFilter} onValueChange={setProfileTagFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Profil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous Profils</SelectItem>
                        <SelectItem value="artist">Artistes</SelectItem>
                        <SelectItem value="professional">Professionnels</SelectItem>
                        <SelectItem value="media">Médias</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t.statistics.gender} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.common.all}</SelectItem>
                        <SelectItem value="women">{t.statistics.women}</SelectItem>
                        <SelectItem value="men">{t.statistics.men}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t.statistics.country} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.common.all}</SelectItem>
                        {[...new Set((detailed?.by_country_gender_domain || []).map(d => d.country))].filter(Boolean).map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={domainFilter} onValueChange={setDomainFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t.statistics.domain} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.common.all}</SelectItem>
                        {[...new Set((detailed?.by_country_gender_domain || []).map(d => d.domain))].filter(Boolean).map(domain => (
                          <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Summary Banner */}
                <div className="bg-muted/40 p-3 rounded-lg flex flex-wrap gap-3 items-center text-xs font-medium border">
                  <span className="text-foreground font-semibold">
                    {genderFilter === 'women' ? 'Aperçu Filtre (Femmes uniquement) :' : genderFilter === 'men' ? 'Aperçu Filtre (Hommes uniquement) :' : 'Aperçu Filtre Global :'}
                  </span>
                  <Badge variant="secondary" className="font-bold">{filteredTotalMembers} Membres</Badge>
                  <Badge variant="outline" className="text-purple-700 border-purple-200">{filteredTotalArtists} Artistes</Badge>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-200">{filteredTotalPros} Professionnels</Badge>
                  <Badge variant="outline" className="text-blue-700 border-blue-200">{filteredTotalMedia} Médias</Badge>
                  <span className="text-muted-foreground ml-auto">
                    👁️ {filteredTotalViews} Vues • 💬 {filteredTotalMsgs} Messages
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>{t.statistics.country}</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead>{t.statistics.domain}</TableHead>
                        <TableHead>Métier (Secteur)</TableHead>
                        <TableHead>{t.statistics.artists}</TableHead>
                        <TableHead>Professionnels</TableHead>
                        <TableHead>Médias</TableHead>
                        <TableHead className="text-right">Engagement</TableHead>
                        <TableHead className="text-right">Vues</TableHead>
                        <TableHead className="text-right">Messages</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitorData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{translateCountry(item.country)}</TableCell>
                          <TableCell>{item.city || 'Non spécifié'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {translateDomain(item.domain)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.sector || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-purple-700">{item.artist_count || 0}</TableCell>
                          <TableCell className="font-semibold text-emerald-700">{item.professional_count || 0}</TableCell>
                          <TableCell className="font-semibold text-blue-700">{item.media_count || 0}</TableCell>
                          <TableCell className="text-right font-bold text-amber-600">
                            {item.engagement_score || ((item.visitor_views_count || 0) + (item.visitor_messages_count || 0) * 3)}
                          </TableCell>
                          <TableCell className="text-right">👁️ {item.visitor_views_count || 0}</TableCell>
                          <TableCell className="text-right">💬 {item.visitor_messages_count || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        );

      case 'postsActivity':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.postsActivity}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t.statistics.featureInDev}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex relative">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:sticky lg:top-16 lg:left-auto lg:bottom-auto lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:z-30 lg:translate-x-0`}>
          <div className="flex items-center justify-between p-4 border-b shrink-0 bg-card">
            <h2 className="text-lg font-semibold">{t.nav.statistics}</h2>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setActiveSection(section.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.label}</span>
                    {activeSection === section.id && <ChevronRight className="h-4 w-4 ml-auto shrink-0" />}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="p-4 sm:p-6 min-w-0">
            {/* Mobile menu button */}
            <div className="lg:hidden mb-4">
              <Button variant="outline" onClick={() => setSidebarOpen(true)} className="gap-2">
                <Menu className="h-4 w-4" />
                {t.common.all}
              </Button>
            </div>

            {/* Section Content */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="min-w-0 space-y-6"
            >
              {renderSection()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
