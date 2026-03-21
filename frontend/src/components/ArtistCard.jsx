import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export function ArtistCard({ artist, featured = false }) {
  const initials = artist.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        to={`/artist/${artist.id}`}
        className={`group relative block overflow-hidden rounded-xl border border-border/50 bg-card hover:border-accent/50 transition-all duration-500 ${
          featured ? 'aspect-[4/5]' : 'aspect-square'
        }`}
        data-testid={`artist-card-${artist.id}`}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={artist.avatar}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Badge 
            variant="secondary" 
            className="mb-3 text-xs uppercase tracking-widest bg-white/10 backdrop-blur-sm border-0"
          >
            {artist.artist_type}
          </Badge>
          <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
            {artist.name}
          </h3>
          {featured && artist.bio && (
            <p className="text-sm text-white/70 line-clamp-2">
              {artist.bio}
            </p>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
    </motion.div>
  );
}

export function ArtistCardCompact({ artist, onClick }) {
  const initials = artist.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors w-full text-left"
      data-testid={`artist-compact-${artist.id}`}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={artist.avatar} alt={artist.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{artist.name}</h4>
        <p className="text-sm text-muted-foreground truncate">{artist.artist_type}</p>
      </div>
    </button>
  );
}
