import React, { useEffect, useMemo, useState, Suspense } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store';
import { Filter, Users, MapPin, Briefcase, Layers, VenusAndMars, RefreshCw } from 'lucide-react';

const LazyResponsiveContainer = React.lazy(() =>
  import('recharts').then((m) => ({ default: m.ResponsiveContainer }))
);
const LazyBarChart = React.lazy(() => import('recharts').then((m) => ({ default: m.BarChart })));
const LazyBar = React.lazy(() => import('recharts').then((m) => ({ default: m.Bar })));
const LazyXAxis = React.lazy(() => import('recharts').then((m) => ({ default: m.XAxis })));
const LazyYAxis = React.lazy(() => import('recharts').then((m) => ({ default: m.YAxis })));
const LazyTooltip = React.lazy(() => import('recharts').then((m) => ({ default: m.Tooltip })));
const LazyCartesianGrid = React.lazy(() => import('recharts').then((m) => ({ default: m.CartesianGrid })));

function ChartFallback({ height = 260 }) {
  return <Skeleton className="w-full" style={{ height }} />;
}

function kpiCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? 0}</div>
      </CardContent>
    </Card>
  );
}

export default function StatisticsExplorer() {
  const { token, user } = useAuthStore();

  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const [country, setCountry] = useState('all');
  const [city, setCity] = useState('all');
  const [sector, setSector] = useState('all');
  const [domain, setDomain] = useState('all');
  const [gender, setGender] = useState('all');
  const [profileTag, setProfileTag] = useState('all');

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [domains, setDomains] = useState([]);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  );

  const effectiveCountry = useMemo(() => {
    // UX: artists should default to their country (security is also enforced server-side)
    if (country !== 'all') return country;
    if (user?.role && user.role !== 'admin' && user.role !== 'institution' && user?.country) return user.country;
    return 'all';
  }, [country, user]);

  const fetchCountries = async () => {
    const res = await axios.get(`${API}/statistics/v2/countries-list`, { headers });
    setCountries(res.data?.countries || []);
  };

  const fetchCities = async (c) => {
    if (!c || c === 'all') {
      setCities([]);
      return;
    }
    const res = await axios.get(`${API}/statistics/v2/filters/cities`, {
      headers,
      params: { country: c },
    });
    setCities(res.data?.cities || []);
  };

  const fetchSectors = async ({ c, ci, tag }) => {
    const res = await axios.get(`${API}/statistics/v2/filters/sectors`, {
      headers,
      params: {
        country: c === 'all' ? undefined : c,
        city: ci === 'all' ? undefined : ci,
        profile_tag: tag === 'all' ? undefined : tag,
      },
    });
    setSectors(res.data?.sectors || []);
  };

  const fetchDomains = async ({ c, ci, se, tag }) => {
    const res = await axios.get(`${API}/statistics/v2/filters/domains`, {
      headers,
      params: {
        country: c === 'all' ? undefined : c,
        city: ci === 'all' ? undefined : ci,
        sector: se === 'all' ? undefined : se,
        profile_tag: tag === 'all' ? undefined : tag,
      },
    });
    setDomains(res.data?.domains || []);
  };

  const fetchExplorer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/statistics/v2/explorer`, {
        headers,
        params: {
          country: effectiveCountry === 'all' ? undefined : effectiveCountry,
          city: city === 'all' ? undefined : city,
          sector: sector === 'all' ? undefined : sector,
          domain: domain === 'all' ? undefined : domain,
          gender: gender === 'all' ? undefined : gender,
          profile_tag: profileTag === 'all' ? undefined : profileTag,
        },
      });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await fetchCountries();
      } catch {
        // ignore here; explorer call will surface auth/network errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Keep dependent option lists up to date
  useEffect(() => {
    if (!token) return;
    fetchCities(effectiveCountry).catch(() => {});
    // Reset city if it no longer applies
    setCity('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCountry, token]);

  useEffect(() => {
    if (!token) return;
    fetchSectors({ c: effectiveCountry, ci: city, tag: profileTag }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCountry, city, profileTag, token]);

  useEffect(() => {
    if (!token) return;
    fetchDomains({ c: effectiveCountry, ci: city, se: sector, tag: profileTag }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCountry, city, sector, profileTag, token]);

  // Fetch explorer on any filter change (simple + predictable UX)
  useEffect(() => {
    if (!token) return;
    fetchExplorer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, effectiveCountry, city, sector, domain, gender, profileTag]);

  const genderChart = useMemo(() => {
    const g = data?.by_gender || {};
    return [
      { name: 'Femmes', value: g.Female || g.female || 0 },
      { name: 'Hommes', value: g.Male || g.male || 0 },
    ];
  }, [data]);

  const roleChart = useMemo(() => {
    const r = data?.by_profile_tag || {};
    const rows = [
      { name: 'Artists', value: r.artist || 0 },
      { name: 'Professionals', value: r.professional || 0 },
      { name: 'Media', value: r.media || 0 },
    ];
    return rows.filter((x) => x.value > 0);
  }, [data]);

  const scopeBadges = useMemo(() => {
    const s = data?.scope || {};
    const items = [
      ['Pays', s.country],
      ['Ville', s.city],
      ['Métier', s.sector],
      ['Domaine', s.domain],
      ['Genre', s.gender],
      ['Type', s.profile_tag],
    ].filter(([, v]) => !!v);
    return items;
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Statistics Explorer</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Filtre au détail près (pays → ville → métier → domaine) et lisibilité d’abord.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchExplorer} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Filtres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type de compte</label>
              <Select value={profileTag} onValueChange={setProfileTag}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="artist">Artistes</SelectItem>
                  <SelectItem value="professional">Professionnels</SelectItem>
                  <SelectItem value="media">Médias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Genre</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Female">Femmes</SelectItem>
                  <SelectItem value="Male">Hommes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium">Pays</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Tous</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name} ({c.artist_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {user?.role && user.role !== 'admin' && user.role !== 'institution' && user?.country && (
                <p className="text-xs text-muted-foreground mt-2">
                  Accès restreint: ton compte voit par défaut le pays <span className="font-medium">{user.country}</span>.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Ville</label>
              <Select value={city} onValueChange={setCity} disabled={effectiveCountry === 'all'}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder={effectiveCountry === 'all' ? 'Choisir un pays d’abord' : 'Toutes les villes'} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Toutes</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name} ({c.users_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Métier (Secteur)</label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Tous les métiers" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Tous</SelectItem>
                  {sectors.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name} ({s.users_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Domaine</label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Tous les domaines" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Tous</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                      {d.name} ({d.users_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-sm text-red-600">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Scope</CardTitle>
                {data?.cached ? <Badge variant="outline">Cached (24h)</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {scopeBadges.length === 0 ? (
                <span className="text-sm text-muted-foreground">Global (toute la plateforme)</span>
              ) : (
                scopeBadges.map(([k, v]) => (
                  <Badge key={`${k}-${v}`} variant="secondary">
                    {k}: {v}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {kpiCard({ title: 'Utilisateurs', value: loading ? '…' : data?.kpis?.total_users, icon: Users })}
            {kpiCard({ title: 'Pays', value: loading ? '…' : data?.kpis?.countries_count, icon: MapPin })}
            {kpiCard({ title: 'Villes', value: loading ? '…' : data?.kpis?.cities_count, icon: MapPin })}
            {kpiCard({ title: 'Métiers', value: loading ? '…' : data?.kpis?.sectors_count, icon: Briefcase })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <VenusAndMars className="h-4 w-4" />
                  Hommes / Femmes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartFallback />
                ) : (
                  <Suspense fallback={<ChartFallback />}>
                    <LazyResponsiveContainer width="100%" height={260}>
                      <LazyBarChart data={genderChart}>
                        <LazyCartesianGrid strokeDasharray="3 3" />
                        <LazyXAxis dataKey="name" />
                        <LazyYAxis allowDecimals={false} />
                        <LazyTooltip />
                        <LazyBar dataKey="value" fill="#7C3AED" />
                      </LazyBarChart>
                    </LazyResponsiveContainer>
                  </Suspense>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Lecture simple: compare directement les volumes (pas de % cachés).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Artistes / Pros / Médias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartFallback />
                ) : roleChart.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune donnée de type de compte dans ce scope.</p>
                ) : (
                  <Suspense fallback={<ChartFallback />}>
                    <LazyResponsiveContainer width="100%" height={260}>
                      <LazyBarChart data={roleChart}>
                        <LazyCartesianGrid strokeDasharray="3 3" />
                        <LazyXAxis dataKey="name" />
                        <LazyYAxis allowDecimals={false} />
                        <LazyTooltip />
                        <LazyBar dataKey="value" fill="#10B981" />
                      </LazyBarChart>
                    </LazyResponsiveContainer>
                  </Suspense>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Utile pour répondre: “combien de professionnels/médias/artistes dans une ville/pays/métier”.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {['cities', 'sectors', 'domains'].map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Top {key === 'cities' ? 'Villes' : key === 'sectors' ? 'Métiers' : 'Domaines'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loading ? (
                    <>
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </>
                  ) : (data?.top?.[key] || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune donnée.</p>
                  ) : (
                    (data.top[key] || []).slice(0, 8).map((row) => (
                      <div key={row.name} className="flex items-center justify-between border rounded px-3 py-2">
                        <span className="text-sm font-medium truncate">{row.name}</span>
                        <Badge variant="secondary">{row.users_count}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

