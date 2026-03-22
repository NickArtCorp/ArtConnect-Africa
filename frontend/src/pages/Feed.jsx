import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFeedStore, useCommentsStore, useAuthStore, useLanguageStore } from '@/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Send, 
  Image, Video, FileText, Loader2, Plus, Trash2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { getMediaUrl } from '@/lib/utils';

function PostCard({ post, onLike, onComment, onDelete, currentUser, language }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const { comments, fetchComments, addComment } = useCommentsStore();
  const postComments = comments[post.id] || [];

  const author = post.author || {};
  const fullName = `${author.first_name || ''} ${author.last_name || ''}`.trim();
  const initials = `${author.first_name?.[0] || ''}${author.last_name?.[0] || ''}`.toUpperCase();
  const isOwner = currentUser?.id === post.author_id;
  const canInteract = currentUser && currentUser.role !== 'institution';
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
    locale: language === 'fr' ? fr : enUS
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
            <p className="text-xs text-muted-foreground">{author.sector} • {timeAgo}</p>
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
            onClick={() => canInteract && onLike(post.id)}
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
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              {/* Comments list */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {postComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {language === 'fr' ? 'Aucun commentaire' : 'No comments yet'}
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
                    placeholder={language === 'fr' ? 'Ajouter un commentaire...' : 'Add a comment...'}
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

function CreatePostDialog({ onClose }) {
  const { language } = useLanguageStore();
  const { uploadPost, createPost } = useFeedStore();
  const [contentType, setContentType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!textContent.trim() && !file) return;

    setIsSubmitting(true);
    
    let result;
    if (file) {
      result = await uploadPost(file, contentType, textContent);
    } else {
      result = await createPost({ content_type: 'text', text_content: textContent });
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(language === 'fr' ? 'Post publié !' : 'Post published!');
      onClose();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Content type selector */}
      <div className="flex gap-2">
        <Button
          variant={contentType === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setContentType('text'); setFile(null); setPreview(null); }}
        >
          <FileText className="w-4 h-4 mr-1" /> {language === 'fr' ? 'Texte' : 'Text'}
        </Button>
        <Button
          variant={contentType === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setContentType('image')}
        >
          <Image className="w-4 h-4 mr-1" /> Image
        </Button>
        <Button
          variant={contentType === 'video' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setContentType('video')}
        >
          <Video className="w-4 h-4 mr-1" /> Video
        </Button>
      </div>

      {/* Text content */}
      <Textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder={language === 'fr' ? 'Partagez quelque chose avec la communauté...' : 'Share something with the community...'}
        rows={4}
        className="resize-none"
      />

      {/* File upload */}
      {contentType !== 'text' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={contentType === 'image' ? 'image/*' : 'video/*'}
            className="hidden"
          />
          
          {preview ? (
            <div className="relative">
              {contentType === 'image' ? (
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <video src={preview} className="w-full h-48 object-cover rounded-lg" controls />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => { setFile(null); setPreview(null); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-32 border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              {contentType === 'image' ? <Image className="w-8 h-8 mr-2" /> : <Video className="w-8 h-8 mr-2" />}
              {language === 'fr' ? 'Cliquez pour ajouter' : 'Click to add'}
            </Button>
          )}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || (!textContent.trim() && !file)}
        className="w-full"
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {language === 'fr' ? 'Publication...' : 'Publishing...'}</>
        ) : (
          language === 'fr' ? 'Publier' : 'Publish'
        )}
      </Button>
    </div>
  );
}

export default function Feed() {
  const { posts, fetchPosts, toggleLike, deletePost, isLoading, hasMore, resetPosts } = useFeedStore();
  const { user } = useAuthStore();
  const { language, t } = useLanguageStore();
  const [createOpen, setCreateOpen] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    resetPosts();
    fetchPosts(true);
  }, []);

  // Infinite scroll
  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !isLoading) {
      fetchPosts();
    }
  }, [hasMore, isLoading, fetchPosts]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  const handleLike = async (postId) => {
    if (!user || user.role === 'institution') {
      toast.error(language === 'fr' ? 'Les institutions ne peuvent pas interagir' : 'Institutions cannot interact');
      return;
    }
    await toggleLike(postId);
  };

  const handleDelete = async (postId) => {
    if (confirm(language === 'fr' ? 'Supprimer ce post ?' : 'Delete this post?')) {
      const result = await deletePost(postId);
      if (result.success) {
        toast.success(language === 'fr' ? 'Post supprimé' : 'Post deleted');
      } else {
        toast.error(result.error);
      }
    }
  };

  const canCreatePost = user && user.role !== 'institution';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
              {language === 'fr' ? 'Communauté' : 'Community'}
            </span>
            <h1 className="text-3xl font-bold tracking-tight mt-1">Feed</h1>
          </div>

          {canCreatePost && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full gap-2" data-testid="create-post-btn">
                  <Plus className="w-4 h-4" />
                  {language === 'fr' ? 'Nouveau post' : 'New Post'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'fr' ? 'Créer un post' : 'Create a post'}</DialogTitle>
                </DialogHeader>
                <CreatePostDialog onClose={() => setCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Institution warning */}
        {user?.role === 'institution' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {language === 'fr' 
                ? '⚠️ En tant qu\'institution, vous pouvez consulter le feed mais pas interagir (liker, commenter, publier).'
                : '⚠️ As an institution, you can view the feed but cannot interact (like, comment, post).'}
            </p>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6" data-testid="feed-posts">
          <AnimatePresence>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
                currentUser={user}
                language={language}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
          {!hasMore && posts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {language === 'fr' ? 'Vous avez tout vu !' : 'You\'ve seen it all!'}
            </p>
          )}
        </div>

        {/* Empty state */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'fr' ? 'Aucun post pour le moment' : 'No posts yet'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {language === 'fr' ? 'Soyez le premier à partager !' : 'Be the first to share!'}
            </p>
            {canCreatePost && (
              <Button onClick={() => setCreateOpen(true)} className="rounded-full">
                {language === 'fr' ? 'Créer un post' : 'Create a post'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
