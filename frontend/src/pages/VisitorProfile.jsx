import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore, useLanguageStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Send, MapPin, Calendar, Building2, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/utils';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function VisitorProfile() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { language, t } = useLanguageStore();
  const [visitor, setVisitor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem('aca_token');

  const fetchVisitor = async () => {
    try {
      setIsLoading(true);
      // Try to fetch visitor from messages endpoint or create a visitor object from user data
      // For now, we'll fetch from the users endpoint and filter for visitors
      const response = await axios.get(`${API}/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setVisitor(response.data);
    } catch (error) {
      toast.error(t.visitorProfile.visitorNotFound);
      setVisitor(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    
    setSending(true);
    try {
      await axios.post(`${API}/messages`, 
        { 
          receiver_id: id, 
          content: messageContent.trim(),
          sender_type: user?.role || 'visitor'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t.profile.messageSent);
      setMessageContent('');
      setMessageOpen(false);
    } catch (error) {
      toast.error(t.profile.messageFailed);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchVisitor();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t.visitorProfile.visitorNotFound}
          </h1>
          <Link to="/discover">
            <Button>{t.common.back}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${visitor.first_name || ''} ${visitor.last_name || ''}`.trim();
  const initials = `${visitor.first_name?.[0] || '?'}${visitor.last_name?.[0] || '?'}`.toUpperCase();
  const isOwnProfile = user?.id === visitor.id;
  const avatarUrl = getMediaUrl(visitor.avatar);
  const isIndividual = visitor.visitor_type === 'individual';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link 
          to="/discover" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.common.back}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            {/* Cover gradient */}
            <div className="h-32 md:h-48 bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-amber-500/5" />

            {/* Profile info */}
            <div className="px-6 md:px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20">
                {/* Avatar with visitor indicator */}
                <div className="relative">
                  <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={fullName} />
                    ) : (
                      <AvatarFallback className="bg-amber-100 text-amber-900 flex items-center justify-center">
                        {isIndividual ? (
                          <User className="w-16 h-16 text-amber-700" />
                        ) : (
                          <Building2 className="w-16 h-16 text-amber-700" />
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {/* Visitor badge */}
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-lg">
                    {t.nav.visitorBadge}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-amber-100 text-amber-900 border-0">
                      {isIndividual ? t.visitorProfile.individual : t.visitorProfile.organization}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    {fullName || `${t.nav.visitorBadge} #${id.slice(0, 8)}`}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                    {visitor.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {visitor.country}{visitor.subregion ? `, ${visitor.subregion}` : ''}
                      </span>
                    )}
                    {visitor.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t.profile.memberSince} {new Date(visitor.created_at).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {user && !isOwnProfile && (
                    <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                      <DialogTrigger asChild>
                        <Button className="rounded-full gap-2">
                          <MessageCircle className="w-4 h-4" />
                          {t.common.send}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.profile.message} - {fullName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea 
                            placeholder={t.profile.writeMessagePlaceholder || t.profile.writeMessage}
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            className="min-h-[120px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => setMessageOpen(false)}
                              disabled={sending}
                            >
                              {t.common.cancel}
                            </Button>
                            <Button 
                              onClick={handleSendMessage}
                              disabled={sending || !messageContent.trim()}
                              gap={2}
                            >
                              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                              {t.common.send}
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {/* Bio */}
              {visitor.bio && (
                <div className="mt-8 pt-8 border-t border-border/50">
                  <h2 className="text-lg font-semibold mb-3">
                    {t.profile.about}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
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
}
