import { useState, useEffect } from 'react';
import { useLanguageStore, useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const apiUrlEnv = process.env.REACT_APP_API_URL;
const isLocalhostEnv = apiUrlEnv && (apiUrlEnv.includes('localhost') || apiUrlEnv.includes('127.0.0.1'));
const isBrowserOnLocalhost = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
const useApiUrl = apiUrlEnv && apiUrlEnv !== 'undefined' && (!isLocalhostEnv || isBrowserOnLocalhost);
const API_URL = useApiUrl ? apiUrlEnv : '';

export default function Actualites() {
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/news`);
        setNews(response.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t.news.title}
          </h1>
          <p className="text-muted-foreground mt-2">{t.nav.news}</p>
        </div>
        {isAdmin && (
          <Button asChild className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
            <Link to="/admin/news">
              <Plus className="w-4 h-4 mr-2" />
              {t.news.addNews}
            </Link>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-secondary/20 animate-pulse" />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground text-lg">{t.news.noNews}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group rounded-2xl">
                {item.media_url && (
                  <div className="aspect-video overflow-hidden bg-black relative">
                    {isVideo(item.media_url) ? (
                      <iframe
                        src={getEmbedUrl(item.media_url)}
                        className="w-full h-full"
                        allowFullScreen
                        title={item.title}
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </div>
                )}
                <CardHeader className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3" />
                    {(() => {
                      try {
                        const d = item.created_at ? new Date(item.created_at) : new Date();
                        return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
                      } catch (e) {
                        return '';
                      }
                    })()}
                  </div>
                  <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-4 leading-relaxed">
                    {item.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
