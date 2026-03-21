import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArtistsStore, useAuthStore, useMessagesStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ArrowLeft, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentArtist, fetchArtist, isLoading } = useArtistsStore();
  const { user } = useAuthStore();
  const { sendMessage } = useMessagesStore();
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
      toast.success('Message sent!');
      setMessageContent('');
      setMessageOpen(false);
      navigate(`/messages/${id}`);
    } else {
      toast.error(result.error || 'Failed to send message');
    }
  };

  if (isLoading || !currentArtist) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = currentArtist.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const isOwnProfile = user?.id === currentArtist.id;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link 
          to="/discover" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          data-testid="back-to-discover"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        >
          {/* Header with avatar */}
          <div className="relative h-48 bg-gradient-to-br from-accent/20 to-secondary">
            <div className="absolute -bottom-16 left-8">
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src={currentArtist.avatar} alt={currentArtist.name} />
                <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-widest">
                  {currentArtist.artist_type}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="artist-name">
                  {currentArtist.name}
                </h1>
                {currentArtist.bio && (
                  <p className="text-muted-foreground max-w-xl" data-testid="artist-bio">
                    {currentArtist.bio}
                  </p>
                )}
              </div>

              {/* Actions */}
              {user && !isOwnProfile && (
                <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full gap-2" data-testid="message-artist-button">
                      <MessageCircle className="w-4 h-4" />
                      Send Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Message {currentArtist.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Write your message..."
                        rows={4}
                        className="resize-none"
                        data-testid="message-textarea"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setMessageOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={sending || !messageContent.trim()}
                          className="gap-2"
                          data-testid="send-message-button"
                        >
                          {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Send
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {isOwnProfile && (
                <Link to="/dashboard">
                  <Button variant="outline" className="rounded-full" data-testid="edit-profile-button">
                    Edit Profile
                  </Button>
                </Link>
              )}

              {!user && (
                <Link to="/login">
                  <Button className="rounded-full gap-2" data-testid="login-to-message">
                    <MessageCircle className="w-4 h-4" />
                    Sign in to Message
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats or additional info could go here */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Member since {new Date(currentArtist.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
