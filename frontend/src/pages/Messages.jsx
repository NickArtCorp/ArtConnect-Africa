import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useMessagesStore, useArtistsStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Messages() {
  const { id: activeUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { conversations, currentMessages, fetchConversations, fetchMessages, sendMessage, clearCurrentMessages, isLoading } = useMessagesStore();
  const { fetchArtist, currentArtist } = useArtistsStore();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, navigate, fetchConversations]);

  useEffect(() => {
    if (activeUserId) {
      fetchMessages(activeUserId);
      fetchArtist(activeUserId);
    } else {
      clearCurrentMessages();
    }
  }, [activeUserId, fetchMessages, fetchArtist, clearCurrentMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUserId) return;

    setSending(true);
    const result = await sendMessage(activeUserId, newMessage.trim());
    setSending(false);

    if (result.success) {
      setNewMessage('');
    } else {
      toast.error(result.error || 'Failed to send message');
    }
  };

  if (!user) return null;

  const activeConversation = conversations.find(c => c.user.id === activeUserId);
  const chatUser = activeConversation?.user || currentArtist;

  return (
    <div className="h-screen pt-16">
      <div className="grid grid-cols-12 h-[calc(100vh-4rem)]">
        {/* Sidebar - Conversations List */}
        <div className={`col-span-12 md:col-span-4 lg:col-span-3 border-r border-border/50 flex flex-col ${
          activeUserId ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-border/50">
            <h2 className="font-bold text-lg">Messages</h2>
          </div>

          <ScrollArea className="flex-1">
            {isLoading && conversations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm mb-4">No conversations yet</p>
                <Link to="/discover">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Find Artists
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-2" data-testid="conversations-list">
                {conversations.map((conv) => {
                  const initials = conv.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
                  const isActive = conv.user.id === activeUserId;

                  return (
                    <Link
                      key={conv.user.id}
                      to={`/messages/${conv.user.id}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
                      }`}
                      data-testid={`conv-item-${conv.user.id}`}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        {conv.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{conv.user.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message?.content || 'No messages'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`col-span-12 md:col-span-8 lg:col-span-9 flex flex-col ${
          !activeUserId ? 'hidden md:flex' : 'flex'
        }`}>
          {activeUserId && chatUser ? (
            <>
              {/* Chat Header */}
              <div className="glass border-b border-border/50 p-4 flex items-center gap-4">
                <Link
                  to="/messages"
                  className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
                  data-testid="back-to-conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link to={`/artist/${chatUser.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={chatUser.avatar} alt={chatUser.name} />
                    <AvatarFallback>
                      {chatUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium" data-testid="chat-user-name">{chatUser.name}</h3>
                    <p className="text-xs text-muted-foreground">{chatUser.artist_type}</p>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto" data-testid="messages-container">
                  {currentMessages.map((msg, index) => {
                    const isSent = msg.sender_id === user.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                            isSent
                              ? 'message-sent text-white rounded-br-md'
                              : 'message-received border border-border/50 rounded-bl-md'
                          }`}
                          data-testid={`message-${msg.id}`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            isSent ? 'text-white/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border/50">
                <form onSubmit={handleSendMessage} className="flex gap-2 max-w-3xl mx-auto">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full bg-secondary/50 border-0"
                    disabled={sending}
                    data-testid="message-input"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full"
                    disabled={sending || !newMessage.trim()}
                    data-testid="send-message-btn"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" data-testid="no-chat-selected">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground text-sm">Choose a conversation or find an artist to message</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
