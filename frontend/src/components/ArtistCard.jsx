import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/store';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';

export function ArtistCard({ artist, featured = false }) {
  const { language } = useLanguageStore();
  const initials = `${artist.first_name?.[0] || ''}${artist.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${artist.first_name} ${artist.last_name}`;
  const yearsActive = new Date().getFullYear() - (artist.year_started || 2020);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        to={`/artist/${artist.id}`}
        className={`group relative block overflow-hidden rounded-2xl border border-border/50 bg-card card-hover ${
          featured ? 'aspect-[3/4]' : 'aspect-square'
        }`}
        data-testid={`artist-card-${artist.id}`}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={artist.avatar}
            alt={fullName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <Badge 
            variant="secondary" 
            className="mb-3 text-xs uppercase tracking-widest bg-primary/20 backdrop-blur-sm border-0 text-white"
          >
            {artist.sector}
          </Badge>
          <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
            {fullName}
          </h3>
          <p className="text-sm text-white/80 mb-2">
            {artist.domain}
          </p>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {artist.country}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {yearsActive} {language === 'fr' ? 'ans' : 'yrs'}
            </span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
    </motion.div>
  );
}

export function ArtistCardCompact({ artist, onClick }) {
  const initials = `${artist.first_name?.[0] || ''}${artist.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${artist.first_name} ${artist.last_name}`;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors w-full text-left"
      data-testid={`artist-compact-${artist.id}`}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={artist.avatar} alt={fullName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{fullName}</h4>
        <p className="text-sm text-muted-foreground truncate">{artist.sector} • {artist.country}</p>
      </div>
    </button>
  );
}
