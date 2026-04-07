import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useMessagesStore, useLanguageStore, usePortfolioStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Settings, ArrowRight, Loader2, Upload, Plus, FileText, Image, Video, Trash2, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/utils';

export default function Dashboard() {
  const { user, updateProfile, fetchUser } = useAuthStore();
  const { conversations, fetchConversations, isLoading } = useMessagesStore();
  const { uploadFile, addVideo, deleteItem, isUploading } = usePortfolioStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();


  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState('image');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, navigate, fetchConversations]);

  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  const unreadCount = conversations.reduce((acc, conv) => acc + conv.unread_count, 0);
  const yearsExperience = new Date().getFullYear() - (user.year_started || 2020);
  const portfolio = user.portfolio || { documents: [], images: [], videos: [] };
  const avatarUrl = getMediaUrl(user.avatar);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, uploadType, uploadTitle, uploadDesc);
    if (result.success) {
      toast.success(uploadType === 'video' ? t.dashboard.videoAdded : t.dashboard.fileUploaded);
      setUploadDialogOpen(false);
      setUploadTitle('');
      setUploadDesc('');
      fetchUser();
    } else {
      toast.error(result.error);
    }
  };


  const handleDelete = async (type, id) => {
    const result = await deleteItem(type, id);
    if (result.success) {
      toast.success(t.dashboard.deleted);
      fetchUser();
    } else {
      toast.error(result.error);
    }
  };

  const openUploadDialog = (type) => {
    setUploadType(type);
    setUploadDialogOpen(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            {t.nav.dashboard}
          </span>
          <h1 className="text-4xl font-bold tracking-tight mt-2">
            {t.dashboard.welcome}, {user.first_name}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-2xl border border-border/50 p-6" data-testid="profile-card">
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="font-bold text-xl">{fullName}</h2>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge className="bg-primary/10 text-primary border-0">{user.sector}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{user.domain}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{user.country}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{yearsExperience} {t.profile.yearsExperience}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Link to={`/artist/${user.id}`}>
                  <Button variant="outline" className="w-full rounded-full justify-between" data-testid="view-profile-button">
                    {t.common.viewProfile}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" className="w-full rounded-full justify-between" data-testid="edit-settings-button">
                    <span className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      {t.profile.editProfile}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Link to="/messages" className="block">
                <div className="stat-card bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/50 transition-colors" data-testid="messages-stat-card">
                  <div className="flex items-center justify-between mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
                    {unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {unreadCount} {t.dashboard.new}
                      </Badge>
                    )}
                  </div>
                  <p className="text-3xl font-bold">{conversations.length}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.conversations}</p>
                </div>
              </Link>

              <Link to="/discover" className="block">
                <div className="stat-card bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/50 transition-colors" data-testid="discover-stat-card">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-3xl font-bold">{t.common.explore}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.findArtists}</p>
                </div>
              </Link>
            </div>

            {/* Portfolio Management */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{t.profile.portfolio}</h3>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full gap-2">
                      <Plus className="w-4 h-4" />
                      {t.dashboard.add}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {uploadType === 'image' ? t.profile.uploadImage : uploadType === 'document' ? t.profile.uploadDocument : t.profile.uploadVideo}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="flex gap-2">
                        <Button variant={uploadType === 'image' ? 'default' : 'outline'} size="sm" onClick={() => setUploadType('image')}><Image className="w-4 h-4 mr-1" /> {t.dashboard.image}</Button>
                        <Button variant={uploadType === 'document' ? 'default' : 'outline'} size="sm" onClick={() => setUploadType('document')}><FileText className="w-4 h-4 mr-1" /> {t.dashboard.document}</Button>
                        <Button variant={uploadType === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setUploadType('video')}><Video className="w-4 h-4 mr-1" /> {t.dashboard.video}</Button>
                      </div>

                      <div className="space-y-2">
                        <Label>{t.dashboard.title}</Label>
                        <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder={t.dashboard.title} />
                      </div>

                      <div className="space-y-2">
                        <Label>{t.dashboard.description}</Label>
                        <Textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder={t.dashboard.description} rows={2} />
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept={
                            uploadType === 'image' ? 'image/*' :
                              uploadType === 'video' ? 'video/mp4,video/mov,video/webm,video/ogv' :
                                '.pdf,.doc,.docx'
                          }
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full gap-2"
                        >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {t.dashboard.chooseFile}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="images" className="w-full">
                <TabsList className="w-full justify-start bg-secondary/50 rounded-xl p-1 mb-4">
                  <TabsTrigger value="images" className="rounded-lg text-sm">
                    {t.profile.images} ({portfolio.images?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="rounded-lg text-sm">
                    {t.profile.documents} ({portfolio.documents?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="rounded-lg text-sm">
                    {t.profile.videos} ({portfolio.videos?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="images">
                  {portfolio.images?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {portfolio.images.map((img) => {
                        const imgUrl = getMediaUrl(img.url);
                        return (
                          <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50">
                            <img
                              src={imgUrl}
                              alt={img.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.classList.add('bg-muted', 'flex', 'items-center', 'justify-center');
                                const placeholder = document.createElement('span');
                                placeholder.className = 'text-muted-foreground text-xs';
                                placeholder.textContent = 'Image not found';
                                e.target.parentElement.appendChild(placeholder);
                              }}
                            />
                            <button
                              onClick={() => handleDelete('images', img.id)}
                              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      {t.dashboard.noImages}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="documents">
                  {portfolio.documents?.length > 0 ? (
                    <div className="space-y-2">
                      {portfolio.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">{doc.filename}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete('documents', doc.id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      {t.dashboard.noDocuments}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="videos">
                  {portfolio.videos?.length > 0 ? (
                    <div className="space-y-2">
                      {portfolio.videos.map((vid) => (
                        <div key={vid.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Video className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{vid.title || 'Video'}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-xs">{vid.filename || 'Video File'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete('videos', vid.id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      {t.dashboard.noVideos}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Recent Messages */}
            <div className="bg-card rounded-2xl border border-border/50 p-6" data-testid="recent-messages">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{t.dashboard.recentMessages}</h3>
                <Link to="/messages">
                  <Button variant="ghost" size="sm" className="gap-2">
                    {t.home.viewAll} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">{t.messages.noConversations}</p>
                  <Link to="/discover">
                    <Button variant="outline" className="rounded-full">
                      {t.messages.findArtists}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.slice(0, 3).map((conv) => {
                    const convName = `${conv.user.first_name} ${conv.user.last_name}`;
                    const convInitials = `${conv.user.first_name?.[0] || ''}${conv.user.last_name?.[0] || ''}`.toUpperCase();
                    const convAvatarUrl = getMediaUrl(conv.user.avatar);
                    return (
                      <Link
                        key={conv.user.id}
                        to={`/messages/${conv.user.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={convAvatarUrl} alt={convName} />
                          <AvatarFallback>{convInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{convName}</h4>
                            {conv.unread_count > 0 && (
                              <Badge className="bg-primary text-primary-foreground text-xs">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message?.content || 'No messages'}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
