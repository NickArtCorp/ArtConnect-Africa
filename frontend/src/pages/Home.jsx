import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useArtistsStore, useAuthStore } from '@/store';
import { ArtistCard } from '@/components/ArtistCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, MessageCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { featuredArtists, fetchFeaturedArtists } = useArtistsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchFeaturedArtists();
  }, [fetchFeaturedArtists]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1636155177192-cb46dba1c569?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Abstract art background"
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Where Artists Connect
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]"
            >
              Create.
              <br />
              <span className="text-accent">Connect.</span>
              <br />
              Collaborate.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl"
            >
              Join a community of artists, musicians, designers, and creators. 
              Discover talent, share your work, and build meaningful collaborations.
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
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/discover" data-testid="hero-explore">
                    <Button variant="outline" size="lg" className="rounded-full px-8">
                      Explore Artists
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/discover" data-testid="hero-discover">
                    <Button size="lg" className="rounded-full px-8 gap-2">
                      Discover Artists <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/messages" data-testid="hero-messages">
                    <Button variant="outline" size="lg" className="rounded-full px-8 gap-2">
                      <MessageCircle className="w-4 h-4" /> Messages
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Showcase Your Art</h3>
              <p className="text-muted-foreground">
                Create a stunning profile that highlights your work and artistic vision.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Find Your People</h3>
              <p className="text-muted-foreground">
                Discover artists across disciplines and find your next collaborator.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Direct Messaging</h3>
              <p className="text-muted-foreground">
                Connect directly with artists. No barriers, just pure collaboration.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Featured
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mt-2">
                  Rising Artists
                </h2>
              </div>
              <Link to="/discover" data-testid="view-all-artists">
                <Button variant="ghost" className="gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-6 stagger-children">
              {featuredArtists.slice(0, 6).map((artist, index) => (
                <div
                  key={artist.id}
                  className={`${
                    index === 0 ? 'md:col-span-4 lg:col-span-6 md:row-span-2' :
                    index === 1 ? 'md:col-span-4 lg:col-span-3' :
                    index === 2 ? 'md:col-span-4 lg:col-span-3' :
                    'md:col-span-4 lg:col-span-4'
                  }`}
                >
                  <ArtistCard artist={artist} featured={index === 0} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="py-32 px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold tracking-tighter mb-6"
            >
              Ready to join the
              <br />
              <span className="text-accent">creative community?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground mb-10"
            >
              Create your artist profile today and start connecting with creators worldwide.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/register" data-testid="cta-register">
                <Button size="lg" className="rounded-full px-12 py-6 text-lg">
                  Create Your Profile
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 ArtSync. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Discover
            </Link>
            <span className="text-sm text-muted-foreground">
              Made for artists, by artists.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
