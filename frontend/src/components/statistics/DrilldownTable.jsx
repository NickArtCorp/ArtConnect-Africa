import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search, Loader2, Users, Briefcase, Tv } from 'lucide-react';
import { useStatisticsStore } from '@/store';

/**
 * DrilldownTable Component
 * Displays top directory for Artists, Professionals, and Media from a country
 */
export default function DrilldownTable({ country }) {
  const { countryStats, isLoadingCountry, fetchCountryStats } = useStatisticsStore();
  const [activeCategory, setActiveCategory] = useState('artists'); // 'artists' | 'professionals' | 'media'
  const [sortBy, setSortBy] = useState('engagement_score');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (country) {
      fetchCountryStats(country);
    }
  }, [country, fetchCountryStats]);

  const topArtists = (countryStats?.top_artists || []).slice(0, 3);
  const topProfessionals = (countryStats?.top_professionals || []).slice(0, 3);
  const topMedia = (countryStats?.top_media || []).slice(0, 3);

  const rawList = activeCategory === 'professionals' ? topProfessionals :
                  activeCategory === 'media' ? topMedia : topArtists;

  // Filter and sort data
  const filteredAndSorted = useMemo(() => {
    let filtered = rawList.filter(item => {
      const name = (item.name || item.company_name || '').toLowerCase();
      const sector = (item.sector || '').toLowerCase();
      const domain = (item.domain || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || sector.includes(term) || domain.includes(term);
    });

    const sortField = sortBy === 'name' ? 'name' :
                      sortBy === 'domain' ? 'domain' :
                      sortBy === 'sector' ? 'sector' :
                      sortBy === 'city' ? 'city' : 'engagement_score';

    filtered.sort((a, b) => {
      let aVal = a[sortField] || 0;
      let bVal = b[sortField] || 0;

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = String(bVal).toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [rawList, sortBy, searchTerm, sortOrder]);

  if (isLoadingCountry) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement du répertoire...</span>
        </CardContent>
      </Card>
    );
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortHeader = ({ label, field }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === field && (
          <ArrowUpDown className="h-3 w-3" style={{
            transform: sortOrder === 'asc' ? 'scaleY(-1)' : 'scaleY(1)'
          }} />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Top Répertoire - {country}</CardTitle>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              size="sm"
              variant={activeCategory === 'artists' ? 'default' : 'ghost'}
              onClick={() => setActiveCategory('artists')}
              className="gap-2 text-xs"
            >
              <Users className="h-3.5 w-3.5" />
              Artistes ({topArtists.length})
            </Button>
            <Button
              size="sm"
              variant={activeCategory === 'professionals' ? 'default' : 'ghost'}
              onClick={() => setActiveCategory('professionals')}
              className="gap-2 text-xs"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Professionnels ({topProfessionals.length})
            </Button>
            <Button
              size="sm"
              variant={activeCategory === 'media' ? 'default' : 'ghost'}
              onClick={() => setActiveCategory('media')}
              className="gap-2 text-xs"
            >
              <Tv className="h-3.5 w-3.5" />
              Médias ({topMedia.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, domaine ou secteur/métier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            {filteredAndSorted.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">Rang</TableHead>
                    <SortHeader label="Nom / Entité" field="name" />
                    <SortHeader label="Domaine" field="domain" />
                    <SortHeader label="Métier (Secteur)" field="sector" />
                    <SortHeader label="Ville" field="city" />
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead className="text-right">Vues</TableHead>
                    <TableHead className="text-right">Messages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.map((item, idx) => (
                    <TableRow key={item.artist_id || item.professional_id || item.media_id || idx} className="hover:bg-muted/30 transition">
                      <TableCell className="font-bold text-primary">#{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.avatar && (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <span className="font-medium text-sm block">{item.name}</span>
                            {item.company_name && (
                              <span className="text-xs text-muted-foreground">{item.company_name}</span>
                            )}
                            {item.media_type && (
                              <span className="text-xs text-muted-foreground">{item.media_type}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item.domain || 'Général'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.sector || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.city || 'N/A'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default" className="font-bold">
                          {item.engagement_score || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        👁️ {item.views || 0}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        💬 {item.messages || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>Aucun résultat correspondant à vos critères.</p>
              </div>
            )}
          </div>

          {/* Summary */}
          {filteredAndSorted.length > 0 && (
            <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
              <span className="text-muted-foreground">
                Affichage de {filteredAndSorted.length} éléments sur {rawList.length}
              </span>
              <div className="flex gap-4">
                <div>
                  <span className="text-muted-foreground">Engagement moyen: </span>
                  <span className="font-bold">
                    {Math.round(
                      filteredAndSorted.reduce((sum, a) => sum + (a.engagement_score || 0), 0) /
                      filteredAndSorted.length
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Vues: </span>
                  <span className="font-bold">
                    {filteredAndSorted.reduce((sum, a) => sum + (a.views || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
