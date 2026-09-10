import { useState, useEffect } from 'react';
import { useLanguageStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Copy, Check, Users, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const apiUrlEnv = process.env.REACT_APP_API_URL;
const isLocalhostEnv = apiUrlEnv && (apiUrlEnv.includes('localhost') || apiUrlEnv.includes('127.0.0.1'));
const isBrowserOnLocalhost = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
const useApiUrl = apiUrlEnv && apiUrlEnv !== 'undefined' && (!isLocalhostEnv || isBrowserOnLocalhost);
const API_URL = useApiUrl ? apiUrlEnv : '';

export default function AdminInstitutions() {
  const { t } = useLanguageStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchInstitutions();
  }, [user, navigate]);

  const fetchInstitutions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/institutions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstitutions(response.data);
    } catch (error) {
      toast.error(t.admin.fetchInstitutionsFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (id) => {
    if (!window.confirm(t.admin.confirmRegenerate)) return;
    setRegeneratingId(id);
    try {
      await axios.post(`${API_URL}/api/admin/institutions/${id}/regenerate-code`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t.admin.codeRegenerated);
      fetchInstitutions();
    } catch (error) {
      toast.error(t.admin.regenerationFailed);
    } finally {
      setRegeneratingId(null);
    }
  };

  const copyToClipboard = (id, code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(t.admin.codeCopied);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInstitutions = institutions.filter(inst => 
    inst.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
            {t.admin.institutions}
          </h1>
          <p className="text-muted-foreground mt-2">{t.admin.manageAccess}</p>
        </div>
        <Button onClick={() => navigate('/admin/create-partner')} className="rounded-full gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          {t.admin.createPartner || 'Créer Code Partenaire'}
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          className="pl-10 rounded-full" 
          placeholder={t.admin.searchPlaceholder} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <Card className="border-dashed py-20 text-center">
          <p className="text-muted-foreground">{t.admin.noInstitutions}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInstitutions.map((inst) => (
            <Card key={inst.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{inst.organization_name}</h3>
                    <p className="text-sm text-muted-foreground">{inst.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {inst.country} • {inst.subregion}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${inst.approval_status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {inst.approval_status}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                        ID: {inst.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-auto flex items-center gap-2 bg-secondary/30 p-1.5 rounded-lg border border-border/50">
                    <code className="text-sm font-mono px-3 py-1 font-bold text-primary">
                      {inst.partner_code || '---'}
                    </code>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      disabled={!inst.partner_code}
                      onClick={() => copyToClipboard(inst.id, inst.partner_code)}
                    >
                      {copiedId === inst.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto rounded-full"
                    disabled={regeneratingId === inst.id}
                    onClick={() => handleRegenerate(inst.id)}
                  >
                    {regeneratingId === inst.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {t.admin.regenerateCode}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
