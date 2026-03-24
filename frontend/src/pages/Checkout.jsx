import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitutionStore, useAuthStore, useLanguageStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, BarChart3, Globe, Users, CheckCircle2, Lock, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Checkout() {
  const { mockCheckout, isLoading, hasPaid, accessCode } = useInstitutionStore();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(hasPaid);

  const fr = language === 'fr';

  const handlePayment = async () => {
    const result = await mockCheckout();
    if (result.success) {
      setSuccess(true);
      toast.success(fr ? 'Paiement accepté ! Accès accordé.' : 'Payment accepted! Access granted.');
      setTimeout(() => navigate('/statistics'), 1500);
    } else {
      toast.error(result.error || (fr ? 'Erreur de paiement' : 'Payment error'));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{fr ? 'Connexion requise' : 'Login required'}</h2>
          <p className="text-muted-foreground mb-4">
            {fr ? 'Connectez-vous avec un compte institution.' : 'Sign in with an institution account.'}
          </p>
          <Button onClick={() => navigate('/login')} className="rounded-full w-full">
            {fr ? 'Se connecter' : 'Sign In'}
          </Button>
        </Card>
      </div>
    );
  }

  if (user.role !== 'institution') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {fr ? 'Réservé aux institutions' : 'Institutions only'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {fr
              ? 'Cet accès est réservé aux comptes de type Institution.'
              : 'This access is reserved for Institution accounts.'}
          </p>
          <Button variant="outline" onClick={() => navigate('/statistics')} className="rounded-full w-full">
            {fr ? 'Voir les stats publiques' : 'View public stats'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge variant="outline" className="mb-4 text-xs px-3 py-1">
            <Building2 className="w-3 h-3 mr-1" />
            {fr ? 'Accès Institutionnel' : 'Institutional Access'}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            {fr ? 'Débloquer les Statistiques' : 'Unlock Statistics'}
          </h1>
          <p className="text-muted-foreground">
            {fr
              ? 'Accédez aux données démographiques complètes de la communauté artistique africaine.'
              : 'Access complete demographic data of the African artistic community.'}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: Users, label: fr ? 'Données démographiques' : 'Demographics', desc: fr ? 'Genre, âge, pays' : 'Gender, age, country' },
            { icon: Globe, label: fr ? 'Couverture géographique' : 'Geography', desc: fr ? 'Par région africaine' : 'By African region' },
            { icon: BarChart3, label: fr ? 'Activité & Tendances' : 'Activity & Trends', desc: fr ? 'Posts, likes, secteurs' : 'Posts, likes, sectors' },
          ].map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="bg-secondary/30 border-border/50">
              <CardContent className="pt-5 pb-4 text-center">
                <Icon className="w-7 h-7 text-primary mx-auto mb-2" />
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Payment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary/20">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">
                {success ? (fr ? '✅ Accès activé' : '✅ Access activated') : (fr ? 'Paiement Fictif' : 'Mock Payment')}
              </CardTitle>
              <CardDescription>
                {success
                  ? (fr ? 'Redirection vers les statistiques...' : 'Redirecting to statistics...')
                  : (fr ? 'Simulation de paiement — aucune donnée bancaire requise' : 'Payment simulation — no bank data required')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {success ? (
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">{fr ? 'Code d\'accès' : 'Access code'}</p>
                    <p className="font-mono text-sm font-bold break-all">{accessCode || useInstitutionStore.getState().accessCode}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Plan details */}
                  <div className="bg-secondary/30 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{fr ? 'Plan Institutionnel' : 'Institutional Plan'}</span>
                      <Badge variant="secondary">{fr ? 'Annuel' : 'Annual'}</Badge>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/40 pt-3">
                      <span className="font-semibold">{fr ? 'Total (simulation)' : 'Total (simulation)'}</span>
                      <span className="text-2xl font-bold text-primary">0 €</span>
                    </div>
                  </div>

                  {/* What's included */}
                  <ul className="space-y-2">
                    {[
                      fr ? 'Statistiques détaillées par genre et pays' : 'Detailed stats by gender and country',
                      fr ? 'Tableau de bord analytique complet' : 'Complete analytics dashboard',
                      fr ? 'Code d\'accès unique et sécurisé' : 'Unique secure access code',
                      fr ? 'Accès illimité aux données' : 'Unlimited data access',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full rounded-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {fr ? 'Traitement...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        {fr ? 'Simuler le paiement & Accéder' : 'Simulate Payment & Access'}
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    {fr
                      ? '🔒 Simulation uniquement — aucune transaction réelle'
                      : '🔒 Simulation only — no real transaction'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
