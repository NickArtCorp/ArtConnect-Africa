import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore, useLanguageStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Moon, Sun, MessageCircle, User, LogOut, Menu, X, Globe, BarChart3, Briefcase, Newspaper } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { language, toggleLanguage, t } = useLanguageStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      {/* African flag stripe */}
      <div className="flag-stripe" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            data-testid="logo-link"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              Art Connect <span className="text-primary">Africa</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/discover" 
              className="text-sm font-medium hover:text-primary transition-colors"
              data-testid="discover-link"
            >
              {t.nav.discover}
            </Link>
            <Link 
              to="/feed" 
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              data-testid="feed-link"
            >
              <Newspaper className="w-4 h-4" />
              {t.nav.feed || 'Feed'}
            </Link>
            <Link 
              to="/projects" 
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              data-testid="projects-link"
            >
              <Briefcase className="w-4 h-4" />
              {t.nav.projects}
            </Link>
            <Link 
              to="/statistics" 
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              data-testid="statistics-link"
            >
              <BarChart3 className="w-4 h-4" />
              {t.nav.statistics}
            </Link>

            {user ? (
              <>
                <Link 
                  to="/messages" 
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  data-testid="messages-link"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.nav.messages}
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  data-testid="dashboard-link"
                >
                  <User className="w-4 h-4" />
                  {t.nav.dashboard}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {t.nav.logout}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="login-link">
                  <Button variant="ghost" size="sm">{t.nav.signIn}</Button>
                </Link>
                <Link to="/register" data-testid="register-link">
                  <Button size="sm" className="rounded-full">{t.nav.getStarted}</Button>
                </Link>
              </>
            )}

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-xs font-medium"
              data-testid="language-toggle"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language.toUpperCase()}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full border-border/50 hover:bg-primary/10"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-xs"
            >
              {language.toUpperCase()}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link 
                to="/discover" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.discover}
              </Link>
              <Link 
                to="/feed" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.feed || 'Feed'}
              </Link>
              <Link 
                to="/projects" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.projects}
              </Link>
              <Link 
                to="/statistics" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.statistics}
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/messages" 
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.messages}
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.dashboard}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="text-sm font-medium hover:text-primary transition-colors py-2 text-left"
                  >
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.signIn}
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.getStarted}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
