import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArtistsStore, useAuthStore, useMessagesStore, useLanguageStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, ArrowLeft, Loader2, Send, MapPin, Calendar, Globe, FileText, Image, Video, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/utils';

export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentArtist, fetchArtist, isLoading } = useArtistsStore();
  const { user } = useAuthStore();
  const { sendMessage } = useMessagesStore();
  const { language, t } = useLanguageStore();
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchArtist(id);
  }, [id, fetchArtist]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    
    setSending(true);
    const result = await sendMessage(id, messageContent.trim());
    setSending(false);
    
    if (result.success) {
      toast.success(t.profile.messageSent);
      setMessageContent('');
      setMessageOpen(false);
      navigate(`/messages/${id}`);
    } else {
      toast.error(result.error || t.profile.messageFailed);
    }
  };

  if (isLoading || !currentArtist) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const fullName = `${currentArtist.first_name} ${currentArtist.last_name}`;
  const initials = `${currentArtist.first_name?.[0] || ''}${currentArtist.last_name?.[0] || ''}`.toUpperCase();
  const isOwnProfile = user?.id === currentArtist.id;
  const yearsExperience = new Date().getFullYear() - (currentArtist.year_started || 2020);
  const portfolio = currentArtist.portfolio || { documents: [], images: [], videos: [] };
  const avatarUrl = getMediaUrl(currentArtist.avatar);

 const getTagLabel = (tag) => {
  if (tag === 'professional') return language === 'fr' ? 'Professionnel' : 'Professional';
  if (tag === 'media') return language === 'fr' ? 'Média' : 'Media';
  return language === 'fr' ? 'Artiste' : 'Artist';
};

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link 
          to="/discover" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          data-testid="back-to-discover"
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
            <div className="h-32 md:h-48 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />

            {/* Profile info */}
            <div className="px-6 md:px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentArtist.role === 'visitor' && (
                      <Badge className="bg-secondary/50 text-secondary-foreground border-0">
                        {t.profile.visitorBadge}
                      </Badge>
                    )}
                    <Badge className="bg-primary/10 text-primary border-0">
                      {currentArtist.sector}
                    </Badge>
                    {currentArtist.profile_tag && currentArtist.domain && (
                      <Badge variant="secondary" className="bg-accent/10 text-accent border border-accent/30">
                        {getTagLabel(currentArtist.profile_tag)} • {currentArtist.domain}
                      </Badge>
                    )}
                    {!currentArtist.profile_tag && currentArtist.domain && (
                      <Badge variant="outline">{currentArtist.domain}</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" data-testid="artist-name">
                    {fullName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {currentArtist.country}, {currentArtist.subregion}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {yearsExperience} {t.profile.yearsExperience}
                    </span>
                    {currentArtist.collaborations_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {currentArtist.collaborations_count} {t.profile.collaborationsCount}
                      </span>
                    )}
                    {currentArtist.visitor_views_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {currentArtist.visitor_views_count} {t.profile.views}
                      </span>
                    )}
                    {currentArtist.website && (
                      <a href={currentArtist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {user && !isOwnProfile && (
                    <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                      <DialogTrigger asChild>
                        <Button className="rounded-full gap-2" data-testid="message-artist-button">
                          <MessageCircle className="w-4 h-4" />
                          {user.role === 'visitor' ? t.profile.contact : t.profile.sendMessage}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.profile.message} - {fullName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder={t.profile.writeMessagePlaceholder}
                            rows={4}
                            className="resize-none"
                            data-testid="message-textarea"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setMessageOpen(false)}>
                              {t.common.cancel}
                            </Button>
                            <Button 
                              onClick={handleSendMessage} 
                              disabled={sending || !messageContent.trim()}
                              className="gap-2"
                              data-testid="send-message-button"
                            >
                              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              {t.common.send}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {isOwnProfile && (
                    <Link to="/dashboard">
                      <Button variant="outline" className="rounded-full" data-testid="edit-profile-button">
                        {t.profile.editProfile}
                      </Button>
                    </Link>
                  )}

                  {!user && (
                    <Link to="/login">
                      <Button className="rounded-full gap-2" data-testid="login-to-message">
                        <MessageCircle className="w-4 h-4" />
                        {t.nav.signIn}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-8">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start bg-card border border-border/50 rounded-xl p-1">
                <TabsTrigger value="about" className="rounded-lg">{t.profile.about}</TabsTrigger>
                {currentArtist.role === 'artist' ? (
                  <TabsTrigger value="portfolio" className="rounded-lg">{t.profile.portfolio}</TabsTrigger>
                ) : null}
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
                  {currentArtist.bio && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">{t.auth.bio}</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{currentArtist.bio}</p>
                    </div>
                  )}
                  {currentArtist.additional_info && (
                    <div>
                      <h3 className="font-semibold mb-3">{t.auth.additionalInfo}</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{currentArtist.additional_info}</p>
                    </div>
                  )}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      {t.profile.memberSince} {new Date(currentArtist.created_at).toLocaleDateString(t.common.langCode === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6">
                <div className="space-y-8">
                  {/* Documents */}
                  {portfolio.documents?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {t.profile.documents}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.documents.map((doc) => {
                          const docUrl = getMediaUrl(doc.url);
                          return (
                            <a
                              key={doc.id}
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                            >
                              <FileText className="w-8 h-8 text-primary" />
                              <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">{doc.description}</p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {portfolio.images?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Image className="w-5 h-5 text-primary" />
                        {t.profile.images}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {portfolio.images.map((img) => {
                          const imgUrl = getMediaUrl(img.url);
                          return (
                            <a
                              key={img.id}
                              href={imgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aspect-square rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-colors"
                            >
                              <img
                                src={imgUrl}
                                alt={img.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {portfolio.videos?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Video className="w-5 h-5 text-primary" />
                        {t.profile.videos}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.videos.map((vid) => (
                          <a
                            key={vid.id}
                            href={vid.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <Video className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">{vid.title || 'Video'}</p>
                              <p className="text-sm text-muted-foreground truncate">{vid.url}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {(!portfolio.documents?.length && !portfolio.images?.length && !portfolio.videos?.length) && (
                    <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                      <p className="text-muted-foreground">
                        {t.profile.noPortfolioItems}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
