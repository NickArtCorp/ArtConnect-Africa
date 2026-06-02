import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommentsStore, useLanguageStore, useReferenceStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Trash2, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { getMediaUrl, translateSector } from '@/lib/utils';

export function PostCard({ post, onLike, onDelete, currentUser }) {
  const { t, language } = useLanguageStore();
  const { sectors } = useReferenceStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const { comments, fetchComments, addComment } = useCommentsStore();
  const postComments = comments[post.id] || [];

  const author = post.author || {};
  const fullName = `${author.first_name || ''} ${author.last_name || ''}`.trim();
  const initials = `${author.first_name?.[0] || ''}${author.last_name?.[0] || ''}`.toUpperCase();
  const isOwner = currentUser?.id === post.author_id;
  const canInteract = currentUser && currentUser.role !== 'partenaire';
  const avatarUrl = getMediaUrl(author.avatar);
  const mediaUrl = getMediaUrl(post.media_url);

  const handleToggleComments = async () => {
    if (!showComments && postComments.length === 0) {
      await fetchComments(post.id);
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !canInteract) return;

    setIsCommenting(true);
    const result = await addComment(post.id, commentText.trim());
    setIsCommenting(false);

    if (result.success) {
      setCommentText('');
    } else {
      toast.error(result.error);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: t.common.langCode === 'fr' ? fr : enUS
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/artist/${post.author_id}`} className="flex items-center gap-3 hover:opacity-80">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{fullName}</p>
            <p className="text-xs text-muted-foreground">{translateSector(author.sector, sectors, language)} • {timeAgo}</p>
          </div>
        </Link>
        
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(post.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      {post.text_content && (
        <div className="px-4 pb-3">
          <p className="text-sm whitespace-pre-line">{post.text_content}</p>
        </div>
      )}

      {/* Media */}
      {post.media_url && mediaUrl && (
        <div className="relative">
          {post.content_type === 'video' ? (
            <video
              src={mediaUrl}
              controls
              className="w-full max-h-[500px] object-cover"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Post media"
              className="w-full max-h-[500px] object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => canInteract && onLike && onLike(post.id)}
            disabled={!canInteract}
            className={`flex items-center gap-2 text-sm transition-colors ${
              post.is_liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            } ${!canInteract ? 'cursor-not-allowed opacity-50' : ''}`}
            data-testid={`like-btn-${post.id}`}
          >
            <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>{post.likes_count || 0}</span>
          </button>

          <button
            onClick={handleToggleComments}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            data-testid={`comment-btn-${post.id}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments_count || 0}</span>
          </button>

          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              key={`comments-${post.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-border/50 overflow-hidden"
            >
              {/* Comments list */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {postComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t.feed.noComments}
                  </p>
                ) : (
                  postComments.map((comment) => {
                    const commentAuthor = comment.author || {};
                    const commentName = `${commentAuthor.first_name || ''} ${commentAuthor.last_name || ''}`.trim();
                    const commentInitials = `${commentAuthor.first_name?.[0] || ''}${commentAuthor.last_name?.[0] || ''}`.toUpperCase();
                    const commentAvatarUrl = getMediaUrl(commentAuthor.avatar);
                    
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={commentAvatarUrl} alt={commentName} />
                          <AvatarFallback className="text-xs">{commentInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-secondary/50 rounded-xl px-3 py-2">
                          <p className="text-sm font-medium">{commentName}</p>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add comment */}
              {canInteract && (
                <form onSubmit={handleSubmitComment} className="flex gap-2 mt-4">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t.feed.addComment}
                    className="flex-1"
                    disabled={isCommenting}
                  />
                  <Button type="submit" size="icon" disabled={isCommenting || !commentText.trim()}>
                    {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
