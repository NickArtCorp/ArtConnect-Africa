import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useArtistsStore, useAuthStore, useLanguageStore, useStatisticsStore } from '@/store';
import { ArtistCard } from '@/components/ArtistCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Globe, Palette, Handshake, FolderOpen, Network, MessageCircle, Info, ShieldCheck, Layout, Zap, Compass, Map, UserPlus, Quote, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { featuredArtists, fetchFeaturedArtists } = useArtistsStore();
  const { user } = useAuthStore();
  const { language, t } = useLanguageStore();
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

      {/* Qui sommes-nous Section */}
      <section className="py-24 px-4 md:px-8 bg-secondary/10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
                {t.home.about.title}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="brush-title">ArtConnect Africa</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.home.about.description}
              </p>
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-4">
                <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                <p className="text-sm font-medium italic">
                  {t.home.about.genesis}
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                  <Layout className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">{t.home.about.digitalSpace.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.home.about.digitalSpace.desc}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-4">{t.home.about.actionProgram.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.home.about.actionProgram.desc}
                </p>
              </motion.div>
            </div>
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

      {/* Missions Section */}
      <section className="py-24 px-4 md:px-8 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
              {t.home.missions.title}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">
              <span className="brush-title">Missions de la plateforme</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, ...t.home.missions.m1, color: 'text-blue-600', bg: 'bg-blue-600/10' },
              { icon: ShieldCheck, ...t.home.missions.m2, color: 'text-green-600', bg: 'bg-green-600/10' },
              { icon: Handshake, ...t.home.missions.m3, color: 'text-orange-600', bg: 'bg-orange-600/10' },
              { icon: Globe, ...t.home.missions.m4, color: 'text-purple-600', bg: 'bg-purple-600/10' },
            ].map((mission, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl ${mission.bg} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                  <mission.icon className={`w-8 h-8 ${mission.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-4">{mission.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mission.desc}
                </p>
              </motion.div>
            ))}
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
                  {t.common.explore}
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

      {/* Geographic Coverage */}
      <section className="py-24 px-4 md:px-8 bg-secondary/10 african-pattern">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { region: t.home.coverage.north, countries: 'Libye, Algérie, Mauritanie, Tunisie, Maroc, Égypte' },
                  { region: 'Afrique de l\'Ouest', countries: 'Sénégal, Ghana, Nigeria, Mali...' },
                  { region: 'Afrique Centrale', countries: 'Cameroun, Congo, Gabon...' },
                  { region: 'Afrique de l\'Est', countries: 'Kenya, Éthiopie, Rwanda...' },
                  { region: 'Afrique Australe', countries: 'Afrique du Sud, Namibie...' },
                  { region: t.home.coverage.world, countries: 'Europe, Amériques, Asie...' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
                  >
                    <h4 className="font-bold text-primary mb-1">{item.region}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.countries}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 space-y-6"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-accent font-bold">
                {t.home.coverage.title}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Un réseau sans frontières
              </h2>
              <p className="text-lg text-muted-foreground">
                {t.home.coverage.description}
              </p>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-secondary flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium">
                  Rejoint par des artistes de <span className="text-primary">54 pays</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Join Section */}
      <section className="py-24 px-4 md:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
              {t.home.howToJoin.title}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">
              Commencez votre voyage en 3 étapes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0" />
            
            {[
              { icon: UserPlus, ...t.home.howToJoin.step1 },
              { icon: Compass, ...t.home.howToJoin.step2 },
              { icon: Zap, ...t.home.howToJoin.step3 },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-xl shadow-primary/20 ring-8 ring-primary/10">
                  <step.icon className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 md:px-8 bg-secondary/30 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-bold">
              {t.home.testimonials.title}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[t.home.testimonials.t1, t.home.testimonials.t2].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-10 rounded-3xl bg-card border border-border/50 relative shadow-sm"
              >
                <Quote className="absolute top-6 right-8 w-12 h-12 text-primary/10" />
                <p className="text-xl italic leading-relaxed mb-8 relative z-10">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.author}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-3 h-3 rounded-full bg-orange-400" />)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-28 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6 whitespace-pre-line"
            >
              {t.home.joinCTA}
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
      <footer className="bg-secondary/20 border-t border-border/50 pt-20 pb-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">A</span>
                </div>
                <span className="font-bold text-xl">ArtConnect <span className="text-primary">Africa</span></span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.home.subtitle}
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold uppercase tracking-widest text-xs text-primary">{t.home.footer.contact}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <span>{t.home.footer.address}</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <a href="mailto:info@artconnectafrica.com" className="hover:text-primary transition-colors">info@artconnectafrica.com</a>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span>+237 699 932 489 / 671 154 274</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold uppercase tracking-widest text-xs text-primary">Navigation</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/discover" className="text-muted-foreground hover:text-primary transition-colors">{t.nav.discover}</Link></li>
                <li><Link to="/feed" className="text-muted-foreground hover:text-primary transition-colors">{t.nav.feed}</Link></li>
                <li><Link to="/projects" className="text-muted-foreground hover:text-primary transition-colors">{t.nav.projects}</Link></li>
                <li><Link to="/actualites" className="text-muted-foreground hover:text-primary transition-colors">{t.nav.news}</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold uppercase tracking-widest text-xs text-primary">{t.home.footer.followUs}</h4>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all">
                    <Globe className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 Art Connect Africa. {t.home.about.genesis}
            </p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
