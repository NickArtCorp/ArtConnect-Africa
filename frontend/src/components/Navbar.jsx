import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Moon, Sun, MessageCircle, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-bold text-2xl tracking-tight hover:text-accent transition-colors"
            data-testid="logo-link"
          >
            ArtSync
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/discover" 
              className="text-sm font-medium hover:text-accent transition-colors"
              data-testid="discover-link"
            >
              Discover
            </Link>

            {user ? (
              <>
                <Link 
                  to="/messages" 
                  className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2"
                  data-testid="messages-link"
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2"
                  data-testid="dashboard-link"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="login-link">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register" data-testid="register-link">
                  <Button size="sm" className="rounded-full">Get Started</Button>
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="theme-toggle-mobile"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
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
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link 
                to="/discover" 
                className="text-sm font-medium hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Discover
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/messages" 
                    className="text-sm font-medium hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-medium hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="text-sm font-medium hover:text-accent transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-sm font-medium hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
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
