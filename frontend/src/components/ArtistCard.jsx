import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/store';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Eye } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

export function ArtistCard({ artist, featured = false }) {
  const { t } = useLanguageStore();
  const initials = `${artist.first_name?.[0] || ''}${artist.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${artist.first_name} ${artist.last_name}`;
  const yearsActive = new Date().getFullYear() - (artist.year_started || 2020);
  const avatarUrl = getMediaUrl(artist.avatar);
  const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`;

  // FEATURE 1 Logic: Collaboration Counter
  const collabCount = artist.collaborations_count || 0;
  const collabLabel = collabCount === 0 
    ? t.common.noCollaborations 
    : `${collabCount} ${collabCount > 1 ? t.common.collaborations : t.common.collaboration}`;

  const getTagLabel = (tag) => {
    if (tag === 'professional') return t.auth.professionalTag;
    if (tag === 'media') return t.auth.mediaTag;
    return t.auth.artistTag;
  };

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
            src={avatarUrl || fallbackUrl}
            alt={fullName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { e.target.src = fallbackUrl; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex gap-2 items-center mb-3">
            <Badge 
              variant="secondary" 
              className="text-[10px] uppercase tracking-widest bg-primary/20 backdrop-blur-sm border-0 text-white px-2 py-0.5"
            >
              {artist.sector}
            </Badge>
            {artist.profile_tag && (
              <Badge 
                variant="outline" 
                className="text-[10px] uppercase tracking-widest bg-white/10 backdrop-blur-sm border-white/20 text-white px-2 py-0.5"
              >
                {getTagLabel(artist.profile_tag)}
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
            {fullName}
          </h3>
          <p className="text-sm text-white/80 mb-2">
            {artist.domain}
          </p>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {artist.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {yearsActive} {t.profile.yrs}
              </span>
              {artist.visitor_views_count !== undefined && (
                <span className="flex items-center gap-1" title={t.statistics.visitorViews}>
                  <Eye className="w-3 h-3" />
                  {artist.visitor_views_count}
                </span>
              )}
            </div>

            {/* Feature 1 — Collaboration Counter */}
            <div className={`flex items-center gap-1.5 text-xs ${collabCount === 0 ? 'text-white/40 italic' : 'text-primary-foreground font-medium'}`}>
              <Users className={`w-3.5 h-3.5 ${collabCount === 0 ? 'opacity-50' : 'text-primary'}`} />
              <span>{collabLabel}</span>
            </div>
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
  const avatarUrl = getMediaUrl(artist.avatar);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors w-full text-left"
      data-testid={`artist-compact-${artist.id}`}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} alt={fullName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{fullName}</h4>
        <p className="text-sm text-muted-foreground truncate">{artist.sector} • {artist.country}</p>
      </div>
    </button>
  );
}
