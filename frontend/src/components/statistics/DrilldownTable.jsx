import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search, Loader2 } from 'lucide-react';
import { useStatisticsStore } from '@/store';

/**
 * DrilldownTable Component
 * Displays top artists from a country
 * Allows sorting by different metrics and searching
 */
export default function DrilldownTable({ country }) {
  const { countryStats, isLoadingV2, fetchCountryStats } = useStatisticsStore();
  const [sortBy, setSortBy] = useState('engagement_score');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (country) {
      fetchCountryStats(country);
    }
  }, [country, fetchCountryStats]);

  const topArtists = countryStats?.top_artists || [];

  // Filter and sort data
  const filteredAndSortedArtists = useMemo(() => {
    let filtered = topArtists.filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortField = sortBy === 'name' ? 'name' :
                      sortBy === 'sector' ? 'sector' :
                      sortBy === 'domain' ? 'domain' :
                      sortBy === 'city' ? 'city' : 'engagement_score';

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [topArtists, sortBy, searchTerm, sortOrder]);

  if (isLoadingV2) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading artists data...</span>
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
        <CardHeader>
          <CardTitle>Top Artists Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, sector, or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            {filteredAndSortedArtists.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">Rank</TableHead>
                    <SortHeader label="Name" field="name" />
                    <SortHeader label="Sector" field="sector" />
                    <SortHeader label="Domain" field="domain" />
                    <SortHeader label="City" field="city" />
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Messages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedArtists.map((artist, idx) => (
                    <TableRow key={artist.artist_id} className="hover:bg-muted/30 transition">
                      <TableCell className="font-bold text-primary">#{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {artist.avatar && (
                            <img
                              src={artist.avatar}
                              alt={artist.name}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="font-medium text-sm">{artist.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {artist.sector}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {artist.domain}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{artist.city || 'N/A'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-bold">
                          {artist.engagement_score}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        👁️ {artist.views}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        💬 {artist.messages}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No artists found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Summary */}
          {filteredAndSortedArtists.length > 0 && (
            <div className="pt-4 border-t flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Showing {filteredAndSortedArtists.length} of {topArtists.length} artists
              </span>
              <div className="flex gap-4">
                <div>
                  <span className="text-muted-foreground">Avg Engagement: </span>
                  <span className="font-bold">
                    {Math.round(
                      filteredAndSortedArtists.reduce((sum, a) => sum + a.engagement_score, 0) /
                      filteredAndSortedArtists.length
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Views: </span>
                  <span className="font-bold">
                    {filteredAndSortedArtists.reduce((sum, a) => sum + a.views, 0)}
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
