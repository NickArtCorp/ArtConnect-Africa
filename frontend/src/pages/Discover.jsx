import { useEffect, useState } from 'react';
import { useArtistsStore, useAuthStore } from '@/store';
import { ArtistCard } from '@/components/ArtistCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ARTIST_TYPES = [
  'All',
  'Visual Artist',
  'Digital Artist',
  'Music Producer',
  'Musician',
  'Photographer',
  'Designer',
  'Visual Designer',
  '3D Artist',
  'Painter',
  'Sculptor',
  'Illustrator',
  'Filmmaker',
  'Animator',
  'Writer'
];

export default function Discover() {
  const { artists, fetchArtists, isLoading, searchQuery, setSearchQuery, artistTypeFilter, setArtistTypeFilter } = useArtistsStore();
  const { user } = useAuthStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    fetchArtists({ search: searchQuery, artist_type: artistTypeFilter });
  }, [searchQuery, artistTypeFilter, fetchArtists]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  // Filter out current user from the list
  const filteredArtists = user 
    ? artists.filter(artist => artist.id !== user.id)
    : artists;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Explore
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mt-2 mb-4">
            Discover Artists
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Find your next collaborator. Connect with artists across every medium and discipline.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search artists by name or bio..."
                className="pl-10 rounded-full bg-secondary/50 border-0"
                data-testid="search-input"
              />
            </div>
            <Button type="submit" className="rounded-full" data-testid="search-button">
              Search
            </Button>
          </form>

          <Select value={artistTypeFilter} onValueChange={setArtistTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 rounded-full bg-secondary/50 border-0" data-testid="filter-select">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {ARTIST_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">No artists found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="artists-grid">
            {filteredArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
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
