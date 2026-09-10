import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore, useLanguageStore } from '@/store';
import { Button } from '@/components/ui/button';
import { 
  Moon, Sun, MessageCircle, User, LogOut, Menu, X, 
  BarChart3, Briefcase, Newspaper, Shield, Building2, 
  CheckCircle, ChevronDown, Settings, Globe, Users,
  PlusCircle, LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';
import { LanguageSelector } from './LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isApproved = user?.approval_status === 'approved';
  const isLoggedIn = user && isApproved;

  const isAdmin = user?.role === 'admin';
  const isPersonnePhysique = user?.role === 'personne_physique';
  const isPersonneMorale = user?.role === 'personne_morale';
  const isPartenaire = user?.role === 'partenaire';
  const isVisitor = user?.role === 'visitor';

  const canSeeStats = isLoggedIn && (isPartenaire || isAdmin);
  const canSeeSocialFeatures = isLoggedIn && (isPersonnePhysique || isPersonneMorale || isAdmin);
  const canSeeMessages = isLoggedIn && (isPersonnePhysique || isPersonneMorale || isAdmin || isVisitor);

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Logo Section */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl tracking-tight hidden xl:block">
                ArtConnect <span className="text-primary">Africa</span>
              </span>
            </Link>

            {/* Main Navigation (Public) */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                to="/discover"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
              >
                {t.nav.discover}
              </Link>
              <Link
                to="/actualites"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
              >
                {t.nav.news}
              </Link>
              
              {/* Network Dropdown */}
              {isLoggedIn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all flex items-center gap-2 outline-none">
                      <span>{t.nav.network}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 mt-2">
                    <DropdownMenuLabel>{t.nav.community || 'Communauté'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {canSeeSocialFeatures && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/feed" className="flex items-center gap-2 py-2 cursor-pointer">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{t.nav.feed}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/projects" className="flex items-center gap-2 py-2 cursor-pointer">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span>{t.nav.projects}</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {canSeeMessages && (
                      <DropdownMenuItem asChild>
                        <Link to="/messages" className="flex items-center gap-2 py-2 cursor-pointer">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          <span>{t.nav.messages}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* RIGHT: Actions & Profile Section */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Admin Quick Access */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 text-primary font-bold bg-primary/5 hover:bg-primary/10">
                    <Shield className="w-4 h-4" />
                    <span className="hidden xl:inline">{t.admin.title}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 mt-2">
                  <DropdownMenuLabel>{t.admin.tools}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/approvals" className="flex items-center gap-3 py-2.5 cursor-pointer">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium leading-none">{t.admin.approvals}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{t.admin.manageRegistrations}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/institutions" className="flex items-center gap-3 py-2.5 cursor-pointer">
                      <Users className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium leading-none">{t.admin.institutions}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{t.admin.managePartnerCodes}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/create-partner" className="flex items-center gap-3 py-2.5 cursor-pointer">
                      <PlusCircle className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium leading-none">{t.admin.createPartner || 'Créer Code Partenaire'}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Générer un accès statistiques</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/news" className="flex items-center gap-3 py-2.5 cursor-pointer">
                      <PlusCircle className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium leading-none">{t.admin.addNews}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{t.admin.publishContent}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="h-6 w-px bg-border/50 mx-1" />

            <LanguageSelector />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-10 w-10 hover:bg-primary/5"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </Button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full border border-border/50 hover:bg-primary/5 transition-all outline-none">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col items-start leading-tight max-w-[100px]">
                      <span className="text-xs font-bold truncate w-full">
                        {user.first_name || user.organization_name}
                      </span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">
                        {user.role?.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-2">
                  <DropdownMenuLabel>{t.nav.myAccount}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-3 py-2.5 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      <span>{t.nav.dashboard}</span>
                    </Link>
                  </DropdownMenuItem>
                  {canSeeStats && (
                    <DropdownMenuItem asChild>
                      <Link to="/statistics" className="flex items-center gap-3 py-2.5 cursor-pointer">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span>{t.nav.statistics}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-3 py-2.5 cursor-pointer">
                      <Settings className="w-4 h-4 text-primary" />
                      <span>{t.nav.profileSettings}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-destructive focus:text-destructive focus:bg-destructive/5 py-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="font-medium">{t.nav.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-bold rounded-full px-5">{t.nav.signIn}</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/25 font-bold">
                    {t.nav.getStarted}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE: Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full h-10 w-10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-border/50 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-4">
              
              {/* Profile Card (Mobile) */}
              {isLoggedIn && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{user.first_name || user.organization_name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{user.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Link to="/discover" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 hover:bg-primary/10 transition-colors gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold">{t.nav.discover}</span>
                </Link>
                <Link to="/actualites" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 hover:bg-primary/10 transition-colors gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Newspaper className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold">{t.nav.news}</span>
                </Link>
              </div>

              {/* Connected Features Grid */}
              {isLoggedIn && (
                <div className="grid grid-cols-3 gap-2">
                  {canSeeSocialFeatures && (
                    <>
                      <Link to="/feed" className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 gap-1.5" onClick={() => setMobileMenuOpen(false)}>
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Flux</span>
                      </Link>
                      <Link to="/projects" className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 gap-1.5" onClick={() => setMobileMenuOpen(false)}>
                        <Briefcase className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Projets</span>
                      </Link>
                    </>
                  )}
                  {canSeeMessages && (
                    <Link to="/messages" className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 gap-1.5" onClick={() => setMobileMenuOpen(false)}>
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Messages</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Admin Section (Mobile) */}
              {isAdmin && (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2">{t.admin.title}</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/admin/approvals" className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-primary font-bold text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <CheckCircle className="w-4 h-4" />
                      {t.admin.approvals}
                    </Link>
                    <Link to="/admin/institutions" className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-primary font-bold text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <Users className="w-4 h-4" />
                      {t.admin.institutions}
                    </Link>
                    <Link to="/admin/create-partner" className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-primary font-bold text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <PlusCircle className="w-4 h-4" />
                      {t.admin.createPartner || 'Créer Code Partenaire'}
                    </Link>
                  </div>
                </div>
              )}

              {/* Footer Actions (Mobile) */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50 px-2">
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                  <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </Button>
                </div>
                {isLoggedIn ? (
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive font-bold gap-2">
                    <LogOut className="w-4 h-4" />
                    {t.nav.logout}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="font-bold">{t.nav.signIn}</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="rounded-full font-bold">{t.nav.getStarted}</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
