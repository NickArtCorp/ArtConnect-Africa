import { useEffect, useState } from 'react';
import { useArtistsStore, useLanguageStore, useReferenceStore } from '@/store';
import { ArtistCard } from '@/components/ArtistCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Discover() {
  const { artists, total, fetchArtists, isLoading, filters, setFilters, resetFilters } = useArtistsStore();
  const { countries, subregions, sectors, domains, genders, fetchReferenceData } = useReferenceStore();
  const { language, t } = useLanguageStore();
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  useEffect(() => {
    fetchArtists();
  }, [filters, fetchArtists]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: localSearch });
  };

  const handleReset = () => {
    setLocalSearch('');
    resetFilters();
  };

  const currentDomains = filters.sector ? (domains[filters.sector] || []) : [];
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

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
            {language === 'fr' ? 'Explorer' : 'Explore'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2 mb-4">
            {t.nav.discover}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {language === 'fr' 
              ? `Découvrez ${total} artistes de toute l'Afrique`
              : `Discover ${total} artists from across Africa`}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border/50 mb-8"
        >
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher par nom...' : 'Search by name...'}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Button type="submit" data-testid="search-button">
              {t.common.search}
            </Button>
          </form>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={filters.subregion} onValueChange={(v) => setFilters({ subregion: v })}>
              <SelectTrigger data-testid="filter-subregion">
                <SelectValue placeholder={language === 'fr' ? 'Sous-région' : 'Subregion'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {subregions.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {language === 'fr' ? s.name_fr : s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.country} onValueChange={(v) => setFilters({ country: v })}>
              <SelectTrigger data-testid="filter-country">
                <SelectValue placeholder={t.auth.country} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="">All</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {language === 'fr' ? c.name_fr : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.sector} onValueChange={(v) => setFilters({ sector: v, domain: '' })}>
              <SelectTrigger data-testid="filter-sector">
                <SelectValue placeholder={t.auth.sector} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {sectors.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {language === 'fr' ? s.name_fr : s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.domain} 
              onValueChange={(v) => setFilters({ domain: v })}
              disabled={!filters.sector}
            >
              <SelectTrigger data-testid="filter-domain">
                <SelectValue placeholder={t.auth.domain} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {currentDomains.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {language === 'fr' ? d.name_fr : d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.gender} onValueChange={(v) => setFilters({ gender: v })}>
              <SelectTrigger data-testid="filter-gender">
                <SelectValue placeholder={t.auth.gender} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {genders.map((g) => (
                  <SelectItem key={g.name} value={g.name}>
                    {language === 'fr' ? g.name_fr : g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <X className="w-4 h-4" />
                {language === 'fr' ? 'Effacer' : 'Clear'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">{t.common.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="artists-grid">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
              >
                <ArtistCard artist={artist} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
