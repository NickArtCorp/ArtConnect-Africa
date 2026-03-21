import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useArtistsStore, useAuthStore, useLanguageStore, useStatisticsStore } from '@/store';
import { ArtistCard } from '@/components/ArtistCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Globe, Palette, Handshake, FolderOpen, Network, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { featuredArtists, fetchFeaturedArtists } = useArtistsStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { overview, fetchOverview } = useStatisticsStore();

  useEffect(() => {
    fetchFeaturedArtists();
    fetchOverview();
  }, [fetchFeaturedArtists, fetchOverview]);

  const totalArtists = overview?.total_artists || 0;
  const totalCountries = overview?.by_subregion ? Object.keys(overview.by_subregion).length * 10 : 54;
  const totalSectors = overview?.by_sector ? Object.keys(overview.by_sector).length : 9;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center african-pattern">
        {/* Background */}
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
                  {t.home.tagline}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
              >
                {t.home.title1}
                <br />
                <span className="gradient-text">{t.home.title2}</span>
                <br />
                {t.home.title3}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-muted-foreground mb-8 max-w-xl"
              >
                {t.home.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                {!user ? (
                  <>
                    <Link to="/register" data-testid="hero-get-started">
                      <Button size="lg" className="rounded-full px-8 gap-2">
                        {t.home.joinCommunity} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to="/discover" data-testid="hero-explore">
                      <Button variant="outline" size="lg" className="rounded-full px-8">
                        {t.home.exploreArtists}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/discover" data-testid="hero-discover">
                      <Button size="lg" className="rounded-full px-8 gap-2">
                        {t.home.exploreArtists} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to="/messages" data-testid="hero-messages">
                      <Button variant="outline" size="lg" className="rounded-full px-8 gap-2">
                        <MessageCircle className="w-4 h-4" /> {t.nav.messages}
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              <div className="stat-card bg-card rounded-2xl p-6 border border-border/50">
                <Users className="w-8 h-8 text-primary mb-3" />
                <p className="text-4xl font-bold">{totalArtists}+</p>
                <p className="text-sm text-muted-foreground">{t.home.stats.artists}</p>
              </div>
              <div className="stat-card bg-card rounded-2xl p-6 border border-border/50">
                <Globe className="w-8 h-8 text-accent mb-3" />
                <p className="text-4xl font-bold">{totalCountries}</p>
                <p className="text-sm text-muted-foreground">{t.home.stats.countries}</p>
              </div>
              <div className="stat-card bg-card rounded-2xl p-6 border border-border/50">
                <Palette className="w-8 h-8 text-primary mb-3" />
                <p className="text-4xl font-bold">{totalSectors}</p>
                <p className="text-sm text-muted-foreground">{t.home.stats.sectors}</p>
              </div>
              <div className="stat-card bg-card rounded-2xl p-6 border border-border/50">
                <Handshake className="w-8 h-8 text-accent mb-3" />
                <p className="text-4xl font-bold">{overview?.total_projects || 0}+</p>
                <p className="text-sm text-muted-foreground">{t.home.stats.projects}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-2xl bg-card border border-border/50 card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <FolderOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.home.features.portfolio.title}</h3>
              <p className="text-muted-foreground">
                {t.home.features.portfolio.desc}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border/50 card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <Network className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.home.features.network.title}</h3>
              <p className="text-muted-foreground">
                {t.home.features.network.desc}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-2xl bg-card border border-border/50 card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Handshake className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.home.features.collaborate.title}</h3>
              <p className="text-muted-foreground">
                {t.home.features.collaborate.desc}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <section className="py-20 px-4 md:px-8 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
                  Featured
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
                  {t.home.featuredArtists}
                </h2>
              </div>
              <Link to="/discover" data-testid="view-all-artists">
                <Button variant="ghost" className="gap-2">
                  {t.home.viewAll} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {featuredArtists.slice(0, 6).map((artist, index) => (
                <div key={artist.id}>
                  <ArtistCard artist={artist} featured={index === 0} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="py-28 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            >
              {t.language === 'fr' ? (
                <>Rejoignez la communauté<br /><span className="gradient-text">artistique africaine</span></>
              ) : (
                <>Join the African<br /><span className="gradient-text">artistic community</span></>
              )}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link to="/register" data-testid="cta-register">
                <Button size="lg" className="rounded-full px-12 py-6 text-lg animate-pulse-glow">
                  {t.home.joinCommunity}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold">Art Connect Africa</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Art Connect Africa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
