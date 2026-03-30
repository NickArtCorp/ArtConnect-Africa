import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectsStore, useAuthStore, useLanguageStore, useReferenceStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    title: '', description: '', sector: '', looking_for: [],
    collaboration_type: 'local', start_date: '', end_date: '', location: ''
  });

  useEffect(() => {
    fetchReferenceData();
    fetchProjects();
  }, [fetchReferenceData, fetchProjects]);

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description || !newProject.sector || !newProject.start_date) {
      toast.error(language === 'fr' ? 'Veuillez remplir les champs obligatoires' : 'Please fill required fields');
      return;
    }

    const result = await createProject(newProject);
    if (result.success) {
      toast.success(language === 'fr' ? 'Projet créé !' : 'Project created!');
      setCreateOpen(false);
      setNewProject({ title: '', description: '', sector: '', looking_for: [], collaboration_type: 'local', start_date: '', end_date: '', location: '' });
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

  const upcomingProjects = projects.filter(p => p.status === 'upcoming');
  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const pastProjects = projects.filter(p => p.status === 'past');

  const renderProjectCard = (project, index) => {
    const creator = project.creator;
    const creatorName = creator ? `${creator.first_name} ${creator.last_name}` : 'Unknown';
    const creatorInitials = creator ? `${creator.first_name?.[0] || ''}${creator.last_name?.[0] || ''}`.toUpperCase() : '?';
    const isOwn = user?.id === project.creator_id;
    
    // Type visual logic
    let typeEmoji = "🏠";
    let typeLabel = t.projects.typeLocal || "Local";
    if (project.collaboration_type === "intra_african") { typeEmoji = "🌍"; typeLabel = t.projects.typeIntra || "Intra-African"; }
    if (project.collaboration_type === "international") { typeEmoji = "🌐"; typeLabel = t.projects.typeIntl || "International"; }

    return (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`bg-card rounded-2xl border border-border/50 p-6 card-hover ${project.status === 'past' ? 'opacity-80' : ''}`}
        data-testid={`project-${project.id}`}
      >
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {project.status === 'ongoing' && (
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" title="Ongoing" />
              )}
              <h3 className="text-xl font-bold">{project.title}</h3>
            </div>
            {project.status !== 'past' && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {project.applications?.length || 0} {t.projects.applications}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="bg-primary/10 text-primary border-0">{project.sector}</Badge>
            <Badge variant="outline" className="text-xs">{typeEmoji} {typeLabel}</Badge>
            {project.location && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {project.location}
              </span>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{project.description}</p>
        
        {/* Dates */}
        <div className="text-xs text-muted-foreground mb-4 space-y-1">
          {project.start_date && (
            <p><strong>{language === 'fr' ? 'Début :' : 'Starts:'}</strong> {new Date(project.start_date).toLocaleDateString()}</p>
          )}
          {project.end_date && (
            <p><strong>{language === 'fr' ? 'Fin :' : 'Ends:'}</strong> {new Date(project.end_date).toLocaleDateString()}</p>
          )}
        </div>

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
              <div className="truncate max-w-[120px]">
                <p className="text-sm font-medium truncate">{creatorName}</p>
                <p className="text-xs text-muted-foreground truncate">{creator.country}</p>
              </div>
            </Link>
          )}

          <div className="shrink-0 flex items-center gap-2">
            {user && !isOwn && project.status !== 'past' && (
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
                        placeholder={language === 'fr' ? 'Présentez-vous...' : 'Introduce yourself...'}
                      />
                    </div>
                    <Button onClick={() => handleApply(project.id)} className="w-full">
                      {language === 'fr' ? 'Envoyer ma candidature' : 'Send Application'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {!user && project.status !== 'past' && (
              <Link to="/login">
                <Button size="sm" variant="outline" className="rounded-full">
                  {t.nav.signIn}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    );
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
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                    <Label>{t.auth.sector} *</Label>
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
                  
                  <div className="space-y-2">
                    <Label>{language === 'fr' ? 'Type de collaboration' : 'Collaboration Type'}</Label>
                    <Select 
                      value={newProject.collaboration_type} 
                      onValueChange={(v) => setNewProject({...newProject, collaboration_type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.projects.typeLocal || 'Local'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">🏠 {t.projects.typeLocal}</SelectItem>
                        <SelectItem value="intra_african">🌍 {t.projects.typeIntra}</SelectItem>
                        <SelectItem value="international">🌐 {t.projects.typeIntl}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.projects.startDate} *</Label>
                      <Input
                        type="date"
                        value={newProject.start_date}
                        onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.projects.endDate}</Label>
                      <Input
                        type="date"
                        value={newProject.end_date}
                        onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'fr' ? 'Lieu' : 'Location'}</Label>
                    <Input
                      value={newProject.location}
                      onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                      placeholder={language === 'fr' ? 'Ville, Pays...' : 'City, Country...'}
                    />
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

        {/* Projects List with Tabs */}
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
          <Tabs defaultValue="ongoing" className="w-full">
            <TabsList className="mb-8 p-1 bg-card border border-border/50 rounded-xl">
              <TabsTrigger value="upcoming" className="rounded-lg">{t.projects.upcoming} ({upcomingProjects.length})</TabsTrigger>
              <TabsTrigger value="ongoing" className="rounded-lg">{t.projects.ongoing} ({ongoingProjects.length})</TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg">{t.projects.past} ({pastProjects.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {upcomingProjects.length === 0 ? (
                <p className="text-muted-foreground p-8 text-center">{language === 'fr' ? 'Aucun projet à venir' : 'No upcoming projects'}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="upcoming-projects-grid">
                  {upcomingProjects.map(renderProjectCard)}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ongoing">
              {ongoingProjects.length === 0 ? (
                <p className="text-muted-foreground p-8 text-center">{language === 'fr' ? 'Aucun projet en cours' : 'No ongoing projects'}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="ongoing-projects-grid">
                  {ongoingProjects.map(renderProjectCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastProjects.length === 0 ? (
                <p className="text-muted-foreground p-8 text-center">{language === 'fr' ? 'Aucun projet passé' : 'No past projects'}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="past-projects-grid">
                  {pastProjects.map(renderProjectCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
