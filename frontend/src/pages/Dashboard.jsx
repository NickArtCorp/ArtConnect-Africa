import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useMessagesStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Settings, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { conversations, fetchConversations, isLoading } = useMessagesStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, navigate, fetchConversations]);

  if (!user) return null;

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const unreadCount = conversations.reduce((acc, conv) => acc + conv.unread_count, 0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Dashboard
          </span>
          <h1 className="text-4xl font-bold tracking-tighter mt-2">
            Welcome back, {user.name?.split(' ')[0]}
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
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-lg">{user.name}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {user.artist_type}
                  </Badge>
                </div>
              </div>

              {user.bio && (
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                  {user.bio}
                </p>
              )}

              <div className="space-y-2">
                <Link to={`/artist/${user.id}`}>
                  <Button variant="outline" className="w-full rounded-full justify-between" data-testid="view-profile-button">
                    View Public Profile
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" className="w-full rounded-full justify-between" data-testid="edit-settings-button">
                    <span className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats and Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Link to="/messages" className="block">
                <div className="bg-card rounded-2xl border border-border/50 p-6 hover:border-accent/50 transition-colors" data-testid="messages-stat-card">
                  <div className="flex items-center justify-between mb-4">
                    <MessageCircle className="w-8 h-8 text-accent" />
                    {unreadCount > 0 && (
                      <Badge className="bg-accent text-accent-foreground">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <p className="text-3xl font-bold">{conversations.length}</p>
                  <p className="text-sm text-muted-foreground">Conversations</p>
                </div>
              </Link>

              <Link to="/discover" className="block">
                <div className="bg-card rounded-2xl border border-border/50 p-6 hover:border-accent/50 transition-colors" data-testid="discover-stat-card">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-3xl font-bold">Explore</p>
                  <p className="text-sm text-muted-foreground">Find Artists</p>
                </div>
              </Link>
            </div>

            {/* Recent Messages */}
            <div className="bg-card rounded-2xl border border-border/50 p-6" data-testid="recent-messages">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Recent Messages</h3>
                <Link to="/messages">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No messages yet</p>
                  <Link to="/discover">
                    <Button variant="outline" className="rounded-full">
                      Find Artists to Connect
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.slice(0, 3).map((conv) => {
                    const convInitials = conv.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
                    return (
                      <Link
                        key={conv.user.id}
                        to={`/messages/${conv.user.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                        data-testid={`conversation-${conv.user.id}`}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                          <AvatarFallback>{convInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conv.user.name}</h4>
                            {conv.unread_count > 0 && (
                              <Badge className="bg-accent text-accent-foreground text-xs">
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
