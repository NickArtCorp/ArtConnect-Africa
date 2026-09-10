import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFeedStore, useCommentsStore, useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { PostCard } from '@/components/PostCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Send, 
  Image, Video, FileText, Loader2, Plus, Trash2, X, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { getMediaUrl, translateSector } from '@/lib/utils';

function CreatePostDialog({ onClose }) {
  const { t } = useLanguageStore();
  const { uploadPost, createPost } = useFeedStore();
  const [contentType, setContentType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Camera capture state
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      setFile(null);
      setPreview(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error(t.common?.langCode === 'fr' || t.feed?.community === 'Communauté' ? "Impossible d'accéder à la caméra" : "Unable to access camera");
      setContentType('image');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const capturedFile = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFile(capturedFile);
          setPreview(URL.createObjectURL(capturedFile));
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  useEffect(() => {
    if (contentType === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [contentType]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleClearPreview = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    if (contentType === 'camera') {
      startCamera();
    }
  };

  const handleSubmit = async () => {
    if (!textContent.trim() && !file) return;

    setIsSubmitting(true);
    
    let result;
    if (file) {
      // For camera captured photos, contentType should be uploaded as 'image'
      const uploadType = contentType === 'camera' ? 'image' : contentType;
      result = await uploadPost(file, uploadType, textContent);
    } else {
      result = await createPost({ content_type: 'text', text_content: textContent });
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(t.feed.postPublished);
      onClose();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Content type selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={contentType === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setContentType('text'); setFile(null); setPreview(null); }}
        >
          <FileText className="w-4 h-4 mr-1" /> {t.feed.text}
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
        <Button
          variant={contentType === 'camera' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setContentType('camera')}
        >
          <Camera className="w-4 h-4 mr-1" /> Camera
        </Button>
      </div>

      {/* Text content */}
      <Textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder={t.feed.shareSomething}
        rows={4}
        className="resize-none"
      />

      {/* Camera Capture Stream */}
      {contentType === 'camera' && !preview && (
        <div className="relative overflow-hidden rounded-lg bg-black border border-border">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          <Button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full gap-2 shadow-lg"
          >
            <Camera className="w-4 h-4" />
            {t.common?.langCode === 'fr' || t.feed?.community === 'Communauté' ? "Prendre Photo" : "Take Photo"}
          </Button>
        </div>
      )}

      {/* File upload or Camera Preview */}
      {contentType !== 'text' && (contentType !== 'camera' || preview) && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={contentType === 'image' ? 'image/*' : 'video/*'}
            className="hidden"
          />
          
          {preview ? (
            <div className="relative border border-border rounded-lg overflow-hidden">
              {contentType === 'image' || contentType === 'camera' ? (
                <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
              ) : (
                <video src={preview} className="w-full h-48 object-cover" controls />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-md"
                onClick={handleClearPreview}
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
              {t.feed.clickToAdd}
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
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.feed.publishing}</>
        ) : (
          t.feed.post
        )}
      </Button>
    </div>
  );
}

export default function Feed() {
  const { posts, fetchPosts, toggleLike, deletePost, isLoading, hasMore, resetPosts } = useFeedStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
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
    if (!user || user.role === 'partenaire') {
      toast.error(t.feed.partnerNoInteract);
      return;
    }
    await toggleLike(postId);
  };

  const handleDelete = async (postId) => {
    if (confirm(t.feed.deleteConfirm || t.common.delete)) {
      const result = await deletePost(postId);
      if (result.success) {
        toast.success(t.feed.postDeleted);
      } else {
        toast.error(result.error);
      }
    }
  };

  const canCreatePost = user && user.role !== 'partenaire';

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
              {t.feed.community}
            </span>
            <h1 className="text-3xl font-bold tracking-tight mt-1">Feed</h1>
          </div>

          {canCreatePost && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full gap-2" data-testid="create-post-btn">
                  <Plus className="w-4 h-4" />
                  {t.feed.newPost}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.feed.createPost}</DialogTitle>
                </DialogHeader>
                <CreatePostDialog onClose={() => setCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Partner warning */}
        {user?.role === 'partenaire' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {t.feed.partnerWarning}
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
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
          {!hasMore && posts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t.feed.seenItAll}
            </p>
          )}
        </div>

        {/* Empty state */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t.feed.noPosts}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t.feed.firstToShare}
            </p>
            {canCreatePost && (
              <Button onClick={() => setCreateOpen(true)} className="rounded-full">
                {t.feed.createPost}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
