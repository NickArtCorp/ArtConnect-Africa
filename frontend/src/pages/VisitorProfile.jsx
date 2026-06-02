import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore, useLanguageStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Calendar, Globe, Info, 
  ArrowLeft, Loader2, User as UserIcon,
  Phone, Mail, Home, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/utils';
import axios from 'axios';

const VisitorProfile = () => {
  const { id } = useParams();
  const { t } = useLanguageStore();
  
  const [visitor, setVisitor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisitorData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/users/${id}`);
        setVisitor(response.data);
      } catch (error) {
        console.error("Error fetching visitor:", error);
        toast.error(t.common.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorData();
  }, [id, t.common.error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold mb-4">{t.visitorProfile?.visitorNotFound || 'Visitor not found'}</h2>
        <Link to="/discover">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> {t.common.back}
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = visitor.role === 'personne_morale' ? visitor.organization_name : `${visitor.first_name} ${visitor.last_name}`;
  const initials = visitor.role === 'personne_morale' 
    ? visitor.organization_name?.[0]?.toUpperCase() 
    : `${visitor.first_name?.[0] || ''}${visitor.last_name?.[0] || ''}`.toUpperCase();
  const avatarUrl = getMediaUrl(visitor.avatar);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="absolute top-24 left-4 md:left-8">
          <Link to="/discover">
            <Button variant="ghost" size="sm" className="bg-background/20 backdrop-blur-md text-foreground hover:bg-background/40 gap-2 rounded-full border border-border/10">
              <ArrowLeft className="w-4 h-4" /> {t.common.back}
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-16 relative z-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border/50 p-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-card shadow-2xl">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="text-4xl">{initials || <UserIcon />}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
                <Badge variant="secondary" className="w-fit mx-auto md:mx-0 bg-primary/10 text-primary border-0">
                  {visitor.role === 'personne_morale' ? t.visitorProfile?.organization || 'Organization' : t.visitorProfile?.individual || 'Individual'}
                </Badge>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{visitor.city}, {visitor.country}</span>
                </div>
                
                {visitor.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{visitor.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm truncate max-w-[200px]" title={visitor.email}>{visitor.email}</span>
                </div>

                {visitor.address && (
                  <div className="flex items-center gap-1.5">
                    <Home className="w-4 h-4" />
                    <span className="text-sm">{visitor.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{t.profile.memberSince} {new Date(visitor.created_at).getFullYear()}</span>
                </div>
                {visitor.website && (
                  <a href={visitor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{t.common.website || 'Website'}</span>
                  </a>
                )}
              </div>

              {visitor.bio && (
                <div className="bg-secondary/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">{t.profile.about}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {visitor.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VisitorProfile;
