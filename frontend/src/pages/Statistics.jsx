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
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = {
  primary: '#7C3AED',
  accent: '#06B6D4',
  pink: '#EC4899',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  green: '#10B981',
  orange: '#F59E0B',
  amber: '#F59E0B'
};

const GENDER_COLORS = {
  women: COLORS.pink,
  men: COLORS.blue,
  other: COLORS.purple
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
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [profileTagFilter, setProfileTagFilter] = useState('all');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchOverview();
    fetchDetailed(sectorFilter === 'all' ? null : sectorFilter, profileTagFilter === 'all' ? null : profileTagFilter);
    fetchCollaborationStats();
  }, [fetchOverview, fetchDetailed, fetchCollaborationStats, sectorFilter, profileTagFilter]);

  // Sidebar sections
  const sections = [
    { id: 'overview', label: t.statistics.overview, icon: BarChart3 },
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
    return matchesGender && matchesCountry && matchesDomain;
  }) || [];

  // Prepare chart data
  const genderPieData = Object.entries(detailed?.by_gender || {}).map(([gender, count]) => ({
    name: gender === 'women' ? t.statistics.women : gender === 'men' ? t.statistics.men : t.statistics.other,
    value: count,
    color: GENDER_COLORS[gender] || COLORS.purple
  }));

  const collaborationTypeData = [
    { name: t.statistics.local, value: collaborations?.by_type?.local || 0, color: COLORS.blue },
    { name: t.statistics.intraAfrican, value: collaborations?.by_type?.intra_african || 0, color: COLORS.green }
  ];

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
      men: collaborations.by_gender.local?.men || 0,
      other: collaborations.by_gender.local?.other || 0
    },
    {
      type: t.statistics.intraAfrican,
      women: collaborations.by_gender.intra_african?.women || 0,
      men: collaborations.by_gender.intra_african?.men || 0,
      other: collaborations.by_gender.intra_african?.other || 0
    }
  ] : [];

  const topCountryPairs = collaborations?.by_country_pair?.slice(0, 10).map(pair => ({
    pair: `${pair.country_a} ↔ ${pair.country_b}`,
    total: pair.total,
    women: pair.women,
    men: pair.men,
    other: pair.other
  })) || [];

  const sectorDistributionData = detailed?.by_sector || [
    { subject: 'Visual Arts', A: 120, fullMark: 150 },
    { subject: 'Music', A: 98, fullMark: 150 },
    { subject: 'Literature', A: 86, fullMark: 150 },
    { subject: 'Dance', A: 99, fullMark: 150 },
    { subject: 'Digital Art', A: 85, fullMark: 150 },
    { subject: 'Fashion', A: 65, fullMark: 150 },
  ];

  const visitorViewsData = filteredVisitorData
    .sort((a, b) => (b.visitor_views_count || 0) - (a.visitor_views_count || 0))
    .slice(0, 10)
    .map(item => ({
      name: `${item.country} - ${item.gender} - ${item.domain}`,
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
                  {t.statistics.totalCollaborations || 'Total'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.statistics.intraAfrican}</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_intra_african_projects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t.statistics.intraAfrican}
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

      case 'collaborations':
        return (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statusData.map((status, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{status.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: status.color }} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{status.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Type Split */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.typeSplit}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={collaborationTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {collaborationTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Evolution */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.monthlyEvolution}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="local" stroke={COLORS.blue} name={t.statistics.local} />
                    <Line type="monotone" dataKey="intra_african" stroke={COLORS.green} name={t.statistics.intraAfrican} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* By Gender */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.byGender}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={genderCollaborationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="women" stackId="a" fill={GENDER_COLORS.women} name={t.statistics.women} />
                    <Bar dataKey="men" stackId="a" fill={GENDER_COLORS.men} name={t.statistics.men} />
                    <Bar dataKey="other" stackId="a" fill={GENDER_COLORS.other} name={t.statistics.other} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Country Pairs */}
            <Card>
              <CardHeader>
                <CardTitle>{fr ? 'Paires de Pays (Intra-Africain)' : 'Intra-African Country Pairs'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCountryPairs.slice(0, 5)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="pair" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="total" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="text-sm text-muted-foreground">
                    {t.statistics.activePair}: {topCountryPairs[0]?.pair || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Country Pairs by Gender (Grouped Bar Chart) */}
            <Card>
              <CardHeader>
                <CardTitle>{fr ? 'Collaborations Intra-Africaines par Genre' : 'Intra-African Collaborations by Gender'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCountryPairs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pair" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="women" fill={GENDER_COLORS.women} name={t.statistics.women} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="men" fill={GENDER_COLORS.men} name={t.statistics.men} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="other" fill={GENDER_COLORS.other} name={t.statistics.other} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Country Pairs by Gender (Table) */}
            <Card>
              <CardHeader>
                <CardTitle>{fr ? 'Détails des Paires de Pays' : 'Country Pair Details'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{fr ? 'Paire de Pays' : 'Country Pair'}</TableHead>
                        <TableHead>{t.statistics.women}</TableHead>
                        <TableHead>{t.statistics.men}</TableHead>
                        <TableHead>{t.statistics.other}</TableHead>
                        <TableHead>{fr ? 'Total' : 'Total'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCountryPairs.map((pair, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{pair.pair}</TableCell>
                          <TableCell>{pair.women}</TableCell>
                          <TableCell>{pair.men}</TableCell>
                          <TableCell>{pair.other}</TableCell>
                          <TableCell className="font-bold">{pair.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
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
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

            {/* Sector Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.bySector}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sectorDistributionData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar
                      name="Artists"
                      dataKey="A"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender by Domain */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.genderByDomain}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={detailed?.by_gender_domain || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="domain" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="women" fill={GENDER_COLORS.women} name={t.statistics.women} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="men" fill={GENDER_COLORS.men} name={t.statistics.men} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="other" fill={GENDER_COLORS.other} name={t.statistics.other} radius={[4, 4, 0, 0]} />
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
                  <div className="text-2xl font-bold">{detailed?.most_messaged_domain || 'N/A'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Domains by Visitor Messages */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.topDomainsByMessages}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={visitorViewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill={COLORS.blue} name={t.statistics.visitorViewsShort} />
                    <Bar dataKey="messages" fill={COLORS.green} name={t.statistics.visitorMessagesShort} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Filterable Table */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.detailedData}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t.auth.sector} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.common.all}</SelectItem>
                      {/* Populate sectors from overview if available */}
                      {overview?.by_sector && Object.keys(overview.by_sector).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t.statistics.country} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.common.all}</SelectItem>
                      {[...new Set(filteredVisitorData.map(d => d.country))].map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
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
                      <SelectItem value="other">{t.statistics.other}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t.statistics.domain} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.common.all}</SelectItem>
                      {[...new Set(filteredVisitorData.map(d => d.domain))].map(domain => (
                        <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.statistics.country}</TableHead>
                        <TableHead>{t.statistics.gender}</TableHead>
                        <TableHead>{t.statistics.domain}</TableHead>
                        <TableHead>{t.statistics.artists}</TableHead>
                        <TableHead>{t.statistics.visitorViewsShort}</TableHead>
                        <TableHead>{t.statistics.visitorMessagesShort}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitorData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.country}</TableCell>
                          <TableCell>{item.gender === 'women' ? t.statistics.women : item.gender === 'men' ? t.statistics.men : t.statistics.other}</TableCell>
                          <TableCell>{item.domain}</TableCell>
                          <TableCell>{item.artist_count || 0}</TableCell>
                          <TableCell>{item.visitor_views_count || 0}</TableCell>
                          <TableCell>{item.visitor_messages_count || 0}</TableCell>
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
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between p-4 border-b">
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
                    <Icon className="h-4 w-4" />
                    {section.label}
                    {activeSection === section.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
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
            >
              {renderSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
