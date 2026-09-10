import React, { useEffect, useMemo, useState } from 'react';
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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const isLocalhostEnv = backendUrl && (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1'));
  const isBrowserOnLocalhost = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
  const useBackendUrl = backendUrl && backendUrl !== 'undefined' && (!isLocalhostEnv || isBrowserOnLocalhost);
  const API = useBackendUrl ? `${backendUrl}/api` : '/api';

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

  const isOrgOrPartner = user && (user.role === 'partenaire' || user.role === 'personne_morale' || user.account_type === 'partner' || (user.role === 'visitor' && user.visitor_type === 'organisation'));

  const effectiveCountry = useMemo(() => {
    if (isOrgOrPartner && user?.country) return user.country;
    if (country !== 'all') return country;
    if (user?.role && user.role !== 'admin' && user?.country) return user.country;
    return 'all';
  }, [country, user, isOrgOrPartner]);

  const fetchCountries = async () => {
    const res = await axios.get(`${API}/statistics/v2/countries-list`, { headers });
    const fetched = Array.isArray(res.data) ? res.data : (res.data?.countries || []);
    setCountries(fetched);
  };

  const fetchCities = async (c) => {
    try {
      const res = await axios.get(`${API}/statistics/v2/filters/cities`, {
        headers,
        params: { country: !c || c === 'all' ? undefined : c },
      });
      setCities(res.data?.cities || []);
    } catch {
      setCities([]);
    }
  };

  const fetchSectors = async ({ c, ci, d, tag }) => {
    try {
      const res = await axios.get(`${API}/statistics/v2/filters/sectors`, {
        headers,
        params: {
          country: c === 'all' ? undefined : c,
          city: ci === 'all' ? undefined : ci,
          domain: d === 'all' ? undefined : d,
          profile_tag: tag === 'all' ? undefined : tag,
        },
      });
      setSectors(res.data?.sectors || []);
    } catch {
      setSectors([]);
    }
  };

  const fetchDomains = async ({ c, ci, tag }) => {
    try {
      const res = await axios.get(`${API}/statistics/v2/filters/domains`, {
        headers,
        params: {
          country: c === 'all' ? undefined : c,
          city: ci === 'all' ? undefined : ci,
          profile_tag: tag === 'all' ? undefined : tag,
        },
      });
      setDomains(res.data?.domains || []);
    } catch {
      setDomains([]);
    }
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
    (async () => {
      try {
        await fetchCountries();
      } catch {
        // ignore here; explorer call will surface auth/network errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep dependent option lists up to date
  useEffect(() => {
    fetchCities(effectiveCountry).catch(() => {});
    // Reset city if it no longer applies
    setCity('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCountry]);

  useEffect(() => {
    fetchSectors({ c: effectiveCountry, ci: city, d: domain, tag: profileTag }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCountry, city, domain, profileTag]);

  useEffect(() => {
    fetchDomains({ c: effectiveCountry, ci: city, tag: profileTag }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCountry, city, profileTag]);

  // Fetch explorer on any filter change (simple + predictable UX)
  useEffect(() => {
    fetchExplorer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCountry, city, sector, domain, gender, profileTag]);

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
              <Select value={effectiveCountry} onValueChange={setCountry} disabled={isOrgOrPartner && user?.country}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Tous</SelectItem>
                  {countries.map((c) => {
                    const name = typeof c === 'string' ? c : c.name;
                    const count = typeof c === 'object' ? (c.artist_count ?? c.users_count ?? c.count) : null;
                    return (
                      <SelectItem key={name} value={name}>
                        {name} {count !== null && count !== undefined ? `(${count})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {user?.country && (
                <div className="p-3 bg-primary/10 border border-primary/25 rounded-xl text-xs text-primary mt-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {isOrgOrPartner 
                      ? `Statistiques ministérielles / organisationnelles verrouillées au pays : ${user.country}` 
                      : `Accès par défaut au pays : ${user.country}`}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Ville</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Toutes les villes" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Toutes</SelectItem>
                  {cities.map((c) => {
                    const name = typeof c === 'string' ? c : c.name;
                    const count = typeof c === 'object' ? (c.users_count ?? c.artist_count ?? c.count) : null;
                    return (
                      <SelectItem key={name} value={name}>
                        {name} {count !== null && count !== undefined ? `(${count})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Domaine</label>
              <Select
                value={domain}
                onValueChange={(val) => {
                  setDomain(val);
                  setSector('all');
                }}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Tous les domaines" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Tous</SelectItem>
                  {domains.map((d) => {
                    const name = typeof d === 'string' ? d : d.name;
                    const count = typeof d === 'object' ? (d.users_count ?? d.artist_count ?? d.count) : null;
                    return (
                      <SelectItem key={name} value={name}>
                        {name} {count !== null && count !== undefined ? `(${count})` : ''}
                      </SelectItem>
                    );
                  })}
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
                  {sectors.map((s) => {
                    const name = typeof s === 'string' ? s : s.name;
                    const count = typeof s === 'object' ? (s.users_count ?? s.artist_count ?? s.count) : null;
                    return (
                      <SelectItem key={name} value={name}>
                        {name} {count !== null && count !== undefined ? `(${count})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {domain !== 'all' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Métiers filtrés pour le domaine <span className="font-medium">{domain}</span>
                </p>
              )}
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
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={genderChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7C3AED" />
                    </BarChart>
                  </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={roleChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Utile pour répondre: “combien de professionnels/médias/artistes dans une ville/pays/métier”.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {['countries', 'cities', 'domains'].map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Top {key === 'countries' ? 'Pays' : key === 'cities' ? 'Villes' : 'Domaines'}
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
                    (data.top[key] || []).slice(0, 3).map((row) => (
                      <div key={row.name} className="flex items-center justify-between border rounded px-3 py-2">
                        <span className="text-sm font-medium truncate">{row.name}</span>
                        <Badge variant="secondary">{row.users_count ?? row.count}</Badge>
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

