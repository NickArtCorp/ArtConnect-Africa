import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore, useLanguageStore, useReferenceStore, useFeedStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/PostCard';
import { 
  MessageCircle, MapPin, Calendar, Globe, Users, 
  ArrowLeft, Loader2, Image as ImageIcon, FileText, Video,
  Info, ExternalLink, Award, Star, Phone, Mail, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getMediaUrl, translateSector, translateDomain } from '@/lib/utils';
import axios from 'axios';

export default function ArtistProfile() {
  const { id } = useParams();
  const { user: currentUser, token } = useAuthStore();
  const { t, language } = useLanguageStore();
  const { sectors, domains } = useReferenceStore();
  const { toggleLike, deletePost } = useFeedStore();
  
  const [artist, setArtist] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/artists/${id}`);
        setArtist(response.data);
      } catch (error) {
        console.error("Error fetching artist:", error);
        toast.error(t.common.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id, t.common.error]);

  useEffect(() => {
    if (activeTab === 'posts' && artist && posts.length === 0) {
      const fetchArtistPosts = async () => {
        setIsPostsLoading(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/posts?author_id=${id}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
          );
          setPosts(response.data);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setIsPostsLoading(false);
        }
      };
      fetchArtistPosts();
    }
  }, [activeTab, id, artist, token, posts.length]);

  const handleLike = async (postId) => {
    if (!currentUser || currentUser.role === 'partenaire') {
      toast.error(t.feed.partnerNoInteract);
      return;
    }
    const result = await toggleLike(postId);
    if (result.success) {
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, is_liked: result.liked, likes_count: result.likes_count } : p
      ));
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm(t.feed.deleteConfirm || t.common.delete)) {
      const result = await deletePost(postId);
      if (result.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success(t.feed.postDeleted);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold mb-4">Artist not found</h2>
        <Link to="/discover">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Discover
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = artist.organization_name || `${artist.first_name} ${artist.last_name}`;
  const initials = artist.organization_name 
    ? artist.organization_name.substring(0, 2).toUpperCase()
    : `${artist.first_name?.[0] || ''}${artist.last_name?.[0] || ''}`.toUpperCase();
  const portfolio = artist.portfolio || { documents: [], images: [], videos: [] };
  const avatarUrl = getMediaUrl(artist.avatar);

  const aboutLabel = artist.role === 'partenaire' || artist.role === 'personne_morale' || (artist.role === 'visitor' && artist.visitor_type === 'organisation')
    ? t.auth.presentationOrg
    : (artist.profile_tag === 'artist' ? t.auth.biographyArtist : t.auth.presentationIndividual);

  const noBioMessage = artist.profile_tag === 'artist' ? "No biography provided." : "No presentation provided.";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute top-24 left-4 md:left-8">
          <Link to="/discover">
            <Button variant="ghost" size="sm" className="bg-background/20 backdrop-blur-md text-white hover:bg-background/40 gap-2 rounded-full border border-white/10">
              <ArrowLeft className="w-4 h-4" /> {t.common.back}
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-24 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl border border-border/50 p-8 shadow-xl shadow-primary/5"
            >
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-card shadow-2xl">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                  </Avatar>
                  {artist.is_verified && (
                    <div className="absolute bottom-2 right-2 bg-primary text-white p-1.5 rounded-full border-2 border-card shadow-lg">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{fullName}</h1>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {artist.sector && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 px-3 py-1">
                      {translateSector(artist.sector, sectors, language)}
                    </Badge>
                  )}
                  {artist.domain && (
                    <Badge variant="outline" className="text-muted-foreground border-border/50 px-3 py-1">
                      {translateDomain(artist.domain, domains, artist.sector, language)}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-center mb-8">
                  <div className="bg-secondary/30 rounded-2xl p-4 min-w-[120px]">
                    <p className="text-2xl font-bold text-primary">{artist.collaborations_count || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {t.profile.collaborationsCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link to={`/messages/${artist.id}`} className="block">
                    <Button className="w-full rounded-full h-12 text-lg gap-2 shadow-lg shadow-primary/20">
                      <MessageCircle className="w-5 h-5" />
                      {t.profile.sendMessage}
                    </Button>
                  </Link>
                  
                  {artist.website && (
                    <a href={artist.website} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full rounded-full h-12 gap-2 border-border/50">
                        <Globe className="w-4 h-4" />
                        {t.common.website || 'Website'}
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                    </a>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-border/50 space-y-4 text-left">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{artist.city}, {artist.country}</span>
                  </div>
                  
                  {artist.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{artist.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[200px]" title={artist.email}>{artist.email}</span>
                  </div>

                  {artist.address && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{artist.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{t.profile.memberSince} {new Date(artist.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              {/* Bio Section */}
              <div className="bg-card rounded-3xl border border-border/50 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight">{aboutLabel}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {artist.bio || noBioMessage}
                </p>
                {artist.additional_info && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                      <Award className="w-4 h-4" />
                      {t.common.additionalInfo || 'Additional Information'}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {artist.additional_info}
                    </p>
                  </div>
                )}
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="portfolio" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start bg-transparent border-b border-border/50 rounded-none h-auto p-0 mb-8 gap-8 overflow-x-auto no-scrollbar">
                  <TabsTrigger 
                    value="portfolio" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-widest transition-all"
                  >
                    {t.profile.portfolio}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="posts" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-widest transition-all"
                  >
                    {t.common.posts || 'Posts'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activities" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-widest transition-all"
                  >
                    {t.common.activities || 'Activities'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="portfolio" className="mt-0">
                  <div className="space-y-8">
                    {/* Images Grid */}
                    {portfolio.images?.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                          <ImageIcon className="w-4 h-4" />
                          {t.profile.images}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {portfolio.images.map((img) => (
                            <motion.div
                              key={img.id}
                              whileHover={{ scale: 1.02 }}
                              className="group relative aspect-square rounded-2xl overflow-hidden border border-border/50 cursor-pointer"
                            >
                              <img 
                                src={getMediaUrl(img.url)} 
                                alt={img.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-white text-xs font-medium truncate">{img.title}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos Section */}
                    {portfolio.videos?.length > 0 && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                          <Video className="w-4 h-4" />
                          {t.profile.videos}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolio.videos.map((vid) => (
                            <div key={vid.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                              <div className="aspect-video bg-black flex items-center justify-center">
                                {vid.url && (vid.url.includes('/videos/') || vid.filename?.match(/\.(mp4|webm|mov|ogv)$/i)) ? (
                                  <video src={getMediaUrl(vid.url)} controls className="w-full h-full object-contain" />
                                ) : (
                                  <div className="text-white/40 flex flex-col items-center p-4 text-center">
                                    <Video className="w-8 h-8 mb-2" />
                                    <span className="text-xs">{vid.title || 'Video File'}</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <p className="font-bold text-sm truncate">{vid.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 truncate">{vid.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents Section */}
                    {portfolio.documents?.length > 0 && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                          <FileText className="w-4 h-4" />
                          {t.profile.documents}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolio.documents.map((doc) => (
                            <a 
                              key={doc.id}
                              href={getMediaUrl(doc.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:bg-secondary/50 transition-colors"
                            >
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{doc.title}</p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{doc.filename?.split('.').pop()} FILE</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-30" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!portfolio.images?.length && !portfolio.videos?.length && !portfolio.documents?.length) && (
                      <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">{t.profile.emptyPortfolio}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="posts" className="mt-0">
                  <div className="space-y-6 max-w-2xl mx-auto">
                    {isPostsLoading ? (
                      <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : posts.length > 0 ? (
                      <AnimatePresence>
                        {posts.map((post) => (
                          <PostCard 
                            key={post.id} 
                            post={post} 
                            onLike={handleLike} 
                            onDelete={handleDeletePost}
                            currentUser={currentUser}
                          />
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
                        <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">{t.feed.noPosts || 'No posts yet'}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="activities" className="mt-0">
                  <div className="space-y-6">
                    {artist.collaborations?.length > 0 ? (
                      <div className="space-y-4">
                        {artist.collaborations.map((collab) => (
                          <div key={collab.id} className="bg-card rounded-3xl border border-border/50 p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-primary/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                              <Users className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest px-2 py-0">
                                  {collab.status}
                                </Badge>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                  {collab.collaboration_type?.replace('_', ' ')}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{collab.title}</h3>
                              <p className="text-sm text-muted-foreground">{translateSector(collab.sector, sectors, language)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {collab.start_date ? new Date(collab.start_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' }) : 'Ongoing'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
                        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">{t.profile.noCollaborations}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
