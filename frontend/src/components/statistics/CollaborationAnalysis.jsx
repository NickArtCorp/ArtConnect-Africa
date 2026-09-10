import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CONTINENTAL_HIERARCHY, COMPARISON_DATA } from '@/data/collaborationMatrices';
import { useLanguageStore } from '@/store';

const COLORS = ['#CC551A', '#248F4D', '#E5A542', '#0369A1', '#7E22CE'];

export default function CollaborationAnalysis() {
  const { t } = useLanguageStore();
  const [entityA, setEntityA] = useState('Morocco');
  const [entityB, setEntityB] = useState('Egypt');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'ongoing', 'past'

  const translateEntity = (name) => {
    const mapping = {
      'North Africa': t.statistics.northAfrica,
      'Sub-Saharan Africa': t.statistics.subSaharanAfrica,
      'West Africa': t.statistics.westAfrica,
      'Central Africa': t.statistics.centralAfrica,
      'East Africa': t.statistics.eastAfrica,
      'Southern Africa': t.statistics.southernAfrica,
      'Maghreb': t.statistics.maghreb,
      'Egypt': t.statistics.egypt,
      'Morocco': t.statistics.morocco,
      'Algeria': t.statistics.algeria,
      'Tunisia': t.statistics.tunisia,
      'Libya': t.statistics.libya,
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

  const translateSector = (name) => {
    const mapping = {
      'Visual Arts': t.statistics.visualArts,
      'Music': t.statistics.music,
      'Cinema': t.statistics.cinema,
      'Literature': t.statistics.literature,
      'Performance': t.statistics.performance,
      'Fashion': t.statistics.fashion
    };
    return mapping[name] || name;
  };

  const comparison = useMemo(() => {
    const found = COMPARISON_DATA.find(d => 
      (d.pair[0] === entityA && d.pair[1] === entityB) ||
      (d.pair[1] === entityA && d.pair[0] === entityB)
    );

    if (!found) return null;

    return {
      ...found,
      sectors: found.sectors?.map(s => ({ ...s, name: translateSector(s.name) }))
    };
  }, [entityA, entityB, t.common.langCode]); // recompute on language change

  const projectsList = useMemo(() => {
    const baseProjects = (comparison && comparison.projects && comparison.projects.length > 0)
      ? comparison.projects
      : [
          { title: "Pan-Arab Heritage Expo", type: "Institutional", year: 2023 },
          { title: "Electronic Fusion Residency", type: "Independent", year: 2024 },
          { title: "Afrobeats ↔ Amapiano Summit", type: "Independent", year: 2023 },
          { title: "Nollywood-SA Distribution Pact", type: "Commercial", year: 2024 },
          { title: "Trans-Saharan Caravans Festival", type: "Independent", year: 2025 },
          { title: "Nile-Niger Digital Residency", type: "Institutional", year: 2022 },
          { title: "Congo Basin Soundscapes", type: "Independent", year: 2024 }
        ];

    return baseProjects.filter(p => {
      const isOngoing = p.year >= 2024;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'ongoing' && isOngoing) || 
        (statusFilter === 'past' && !isOngoing);

      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = (p.title || '').toLowerCase().includes(q) ||
                            (p.type || '').toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [comparison, searchQuery, statusFilter]);

  const allEntities = useMemo(() => {
    const list = [];
    Object.keys(CONTINENTAL_HIERARCHY).forEach(hub => {
      list.push({ type: 'hub', name: hub });
      if (typeof CONTINENTAL_HIERARCHY[hub].countries === 'object' && !Array.isArray(CONTINENTAL_HIERARCHY[hub].countries)) {
        Object.keys(CONTINENTAL_HIERARCHY[hub].countries).forEach(sub => {
          list.push({ type: 'sub', name: sub });
          CONTINENTAL_HIERARCHY[hub].countries[sub].forEach(c => list.push({ type: 'country', name: c }));
        });
      } else {
        CONTINENTAL_HIERARCHY[hub].countries.forEach(c => list.push({ type: 'country', name: c }));
      }
    });
    return list;
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t.statistics.collaborationAnalysis}</h1>
        <p className="text-muted-foreground">{t.statistics.ecosystemMapping} ({t.statistics.detailedData})</p>
      </header>

      {/* Comparison Selector */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="w-full md:w-64">
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">{t.statistics.entityA}</label>
              <Select value={entityA} onValueChange={setEntityA}>
                <SelectTrigger>
                  <SelectValue placeholder={t.statistics.entityA} />
                </SelectTrigger>
                <SelectContent>
                  {allEntities.map(e => (
                    <SelectItem key={`a-${e.name}`} value={e.name}>
                      <span className={e.type === 'hub' ? 'font-bold' : e.type === 'sub' ? 'pl-2 text-primary' : 'pl-4'}>
                        {translateEntity(e.name)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-primary font-black text-2xl">↔</div>

            <div className="w-full md:w-64">
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">{t.statistics.entityB}</label>
              <Select value={entityB} onValueChange={setEntityB}>
                <SelectTrigger>
                  <SelectValue placeholder={t.statistics.entityB} />
                </SelectTrigger>
                <SelectContent>
                  {allEntities.map(e => (
                    <SelectItem key={`b-${e.name}`} value={e.name}>
                      <span className={e.type === 'hub' ? 'font-bold' : e.type === 'sub' ? 'pl-2 text-primary' : 'pl-4'}>
                        {translateEntity(e.name)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!comparison ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground italic">{t.statistics.noComparisonData}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Pie Chart: Sectoral Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.sectoralDistribution}</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={comparison.sectors || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(comparison.sectors || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 2. Bar Chart: Yearly Evolution */}
            <Card>
              <CardHeader>
                <CardTitle>{t.statistics.annualVolume} ({comparison.evolution?.[0]?.year}-{comparison.evolution?.[comparison.evolution?.length-1]?.year})</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={comparison.evolution || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#CC551A" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#CC551A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#CC551A" fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div>
            {/* 3. Active Projects Matrix */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">
                  {t.common.langCode === 'fr' ? 'Projet de collaboration' : 'Collaboration Project'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Unified Search & Status Filter Band */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/40">
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none text-sm">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.common.langCode === 'fr' ? "Rechercher un projet..." : "Search a project..."}
                      className="w-full bg-background border border-border/80 pl-9 pr-8 py-1.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1 bg-background border border-border/60 p-1 rounded-md shrink-0 w-full sm:w-auto overflow-x-auto justify-around">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                        statusFilter === 'all' 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {t.common.langCode === 'fr' ? 'Tous' : 'All'}
                    </button>
                    <button
                      onClick={() => setStatusFilter('ongoing')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${
                        statusFilter === 'ongoing' 
                          ? 'bg-green-600 text-white shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {t.projects.ongoing || 'En cours'}
                    </button>
                    <button
                      onClick={() => setStatusFilter('past')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${
                        statusFilter === 'past' 
                          ? 'bg-gray-600 text-white shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {t.common.langCode === 'fr' ? 'Passés' : 'Past'}
                    </button>
                  </div>
                </div>

                {/* Table with filtered results */}
                <div className="border border-border/40 rounded-md overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>{t.statistics.projectTitle}</TableHead>
                        <TableHead>{t.statistics.type}</TableHead>
                        <TableHead>{t.statistics.year}</TableHead>
                        <TableHead className="text-right">{t.statistics.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectsList.length > 0 ? (
                        projectsList.map((p, i) => {
                          const isOngoing = p.year >= 2024;
                          return (
                            <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-semibold text-foreground">{p.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal bg-background/50">
                                  {p.type === 'Institutional' ? t.statistics.institutional : 
                                   p.type === 'Independent' ? t.statistics.independent : p.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{p.year}</TableCell>
                              <TableCell className="text-right">
                                {isOngoing ? (
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {t.projects.ongoing}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                    {t.common.langCode === 'fr' ? 'Passé' : 'Past'}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            {t.common.langCode === 'fr' ? 'Aucun projet ne correspond aux critères de recherche.' : 'No projects match your search criteria.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
