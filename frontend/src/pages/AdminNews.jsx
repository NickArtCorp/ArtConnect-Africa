import { useState, useEffect } from 'react';
import { useLanguageStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Edit, Plus, ArrowLeft, Video, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function AdminNews() {
  const { t } = useLanguageStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    media_url: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchNews();
  }, [user, navigate]);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/news`);
      setNews(response.data);
    } catch (error) {
      toast.error(t.admin.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Clean payload
      const payload = {
        ...formData,
        media_url: formData.media_url || null
      };
      
      if (editingId) {
        await axios.put(`${API_URL}/api/admin/news/${editingId}`, payload, config);
        toast.success(t.news.created);
      } else {
        await axios.post(`${API_URL}/api/admin/news`, payload, config);
        toast.success(t.news.created);
      }
      
      setFormData({ title: '', content: '', media_url: '' });
      setEditingId(null);
      fetchNews();
    } catch (error) {
      toast.error(t.admin.operationFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.feed.deleteConfirm)) return;
    try {
      await axios.delete(`${API_URL}/api/admin/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t.news.deleted);
      fetchNews();
    } catch (error) {
      toast.error(t.admin.deleteFailed);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      media_url: item.media_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" asChild className="rounded-full">
          <Link to="/news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.profile.backToDiscover}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{t.news.addNews}</h1>
      </div>

      <Card className="mb-12 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{editingId ? t.news.editNews : t.news.addNews}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t.news.newsTitle}</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>{t.news.newsContent}</Label>
              <Textarea 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required 
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.mediaUrl}</Label>
              <div className="flex gap-2">
                <Input 
                  value={formData.media_url} 
                  onChange={(e) => setFormData({...formData, media_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=... ou lien image"
                />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                {t.admin.mediaHelp}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="rounded-full px-8">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t.news.save}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: '', content: '', media_url: '' });
                  }}
                >
                  {t.profile.cancel}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">{t.nav.news}</h2>
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        ) : news.length === 0 ? (
          <p className="text-center text-muted-foreground">{t.news.noNews}</p>
        ) : (
          news.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {item.media_url && (
                  <div className="w-full md:w-48 h-32 bg-secondary/30 flex items-center justify-center shrink-0">
                    {item.media_url.includes('youtube') || item.media_url.includes('youtu.be') ? (
                      <Video className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <img src={item.media_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                <div className="p-4 flex-1 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
