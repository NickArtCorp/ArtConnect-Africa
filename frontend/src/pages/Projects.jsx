import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectsStore, useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Loader2, Users, Briefcase, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Projects() {
  const { projects, fetchProjects, createProject, applyToProject, isLoading } = useProjectsStore();
  const { sectors, domains, fetchReferenceData } = useReferenceStore();
  const { user } = useAuthStore();
  const { language, t } = useLanguageStore();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    sector: '',
    looking_for: []
  });

  useEffect(() => {
    fetchReferenceData();
    fetchProjects();
  }, [fetchReferenceData, fetchProjects]);

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description || !newProject.sector) {
      toast.error(language === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields');
      return;
    }

    const result = await createProject(newProject);
    if (result.success) {
      toast.success(language === 'fr' ? 'Projet créé !' : 'Project created!');
      setCreateOpen(false);
      setNewProject({ title: '', description: '', sector: '', looking_for: [] });
    } else {
      toast.error(result.error);
    }
  };

  const handleApply = async (projectId) => {
    const result = await applyToProject(projectId, applyMessage);
    if (result.success) {
      toast.success(language === 'fr' ? 'Candidature envoyée !' : 'Application sent!');
      setApplyOpen(null);
      setApplyMessage('');
    } else {
      toast.error(result.error);
    }
  };

  const currentDomains = newProject.sector ? (domains[newProject.sector] || []) : [];

  const toggleLookingFor = (domain) => {
    setNewProject(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(domain)
        ? prev.looking_for.filter(d => d !== domain)
        : [...prev.looking_for, domain]
    }));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
              {language === 'fr' ? 'Collaboration' : 'Collaboration'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
              {t.projects.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'fr' 
                ? 'Trouvez des collaborateurs pour vos projets artistiques'
                : 'Find collaborators for your artistic projects'}
            </p>
          </div>

          {user && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full gap-2" data-testid="create-project-btn">
                  <Plus className="w-4 h-4" />
                  {t.projects.createProject}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t.projects.createProject}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{language === 'fr' ? 'Titre du projet' : 'Project Title'}</Label>
                    <Input
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder={language === 'fr' ? 'Ex: Exposition Collective 2026' : 'Ex: Collective Exhibition 2026'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      rows={3}
                      placeholder={language === 'fr' ? 'Décrivez votre projet...' : 'Describe your project...'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.auth.sector}</Label>
                    <Select 
                      value={newProject.sector} 
                      onValueChange={(v) => setNewProject({...newProject, sector: v, looking_for: []})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.auth.selectSector} />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((s) => (
                          <SelectItem key={s.name} value={s.name}>
                            {language === 'fr' ? s.name_fr : s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newProject.sector && (
                    <div className="space-y-2">
                      <Label>{t.projects.lookingFor}</Label>
                      <div className="flex flex-wrap gap-2">
                        {currentDomains.map((d) => (
                          <Badge
                            key={d.name}
                            variant={newProject.looking_for.includes(d.name) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleLookingFor(d.name)}
                          >
                            {language === 'fr' ? d.name_fr : d.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleCreateProject} className="w-full">
                    {language === 'fr' ? 'Créer le projet' : 'Create Project'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Projects List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border/50">
            <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {language === 'fr' ? 'Aucun projet pour le moment' : 'No projects yet'}
            </p>
            {user && (
              <Button onClick={() => setCreateOpen(true)} className="rounded-full">
                {t.projects.createProject}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="projects-grid">
            {projects.map((project, index) => {
              const creator = project.creator;
              const creatorName = creator ? `${creator.first_name} ${creator.last_name}` : 'Unknown';
              const creatorInitials = creator ? `${creator.first_name?.[0] || ''}${creator.last_name?.[0] || ''}`.toUpperCase() : '?';
              const isOwn = user?.id === project.creator_id;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-card rounded-2xl border border-border/50 p-6 card-hover"
                  data-testid={`project-${project.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-primary/10 text-primary border-0">{project.sector}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {project.applications?.length || 0} {t.projects.applications}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>

                  {project.looking_for?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">{t.projects.lookingFor}:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.looking_for.map((domain) => (
                          <Badge key={domain} variant="outline" className="text-xs">
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    {creator && (
                      <Link to={`/artist/${creator.id}`} className="flex items-center gap-2 hover:opacity-80">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={creator.avatar} alt={creatorName} />
                          <AvatarFallback className="text-xs">{creatorInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{creatorName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {creator.country}
                          </p>
                        </div>
                      </Link>
                    )}

                    {user && !isOwn && (
                      <Dialog open={applyOpen === project.id} onOpenChange={(open) => setApplyOpen(open ? project.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="rounded-full">
                            {t.projects.apply}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t.projects.apply} - {project.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>{language === 'fr' ? 'Message (optionnel)' : 'Message (optional)'}</Label>
                              <Textarea
                                value={applyMessage}
                                onChange={(e) => setApplyMessage(e.target.value)}
                                rows={3}
                                placeholder={language === 'fr' ? 'Présentez-vous et expliquez pourquoi vous souhaitez collaborer...' : 'Introduce yourself and explain why you want to collaborate...'}
                              />
                            </div>
                            <Button onClick={() => handleApply(project.id)} className="w-full">
                              {language === 'fr' ? 'Envoyer ma candidature' : 'Send Application'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {!user && (
                      <Link to="/login">
                        <Button size="sm" variant="outline" className="rounded-full">
                          {t.nav.signIn}
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
