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
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(hasPaid);

  const handlePayment = async () => {
    const result = await mockCheckout();
    if (result.success) {
      setSuccess(true);
      toast.success(t.checkout.paymentAccepted);
      setTimeout(() => navigate('/statistics'), 1500);
    } else {
      toast.error(result.error || t.checkout.paymentError);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t.checkout.loginRequired}</h2>
          <p className="text-muted-foreground mb-4">
            {t.checkout.signInInstitution}
          </p>
          <Button onClick={() => navigate('/login')} className="rounded-full w-full">
            {t.nav.signIn}
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
            {t.checkout.institutionsOnly}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t.checkout.accessReserved}
          </p>
          <Button variant="outline" onClick={() => navigate('/statistics')} className="rounded-full w-full">
            {t.checkout.viewPublicStats}
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
            {t.checkout.institutionalAccess}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            {t.checkout.title}
          </h1>
          <p className="text-muted-foreground">
            {t.checkout.subtitle}
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
            { icon: Users, label: t.checkout.demographics, desc: t.checkout.demographicsDesc },
            { icon: Globe, label: t.checkout.geography, desc: t.checkout.geographyDesc },
            { icon: BarChart3, label: t.checkout.activityTrends, desc: t.checkout.activityTrendsDesc },
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
                {success ? `✅ ${t.checkout.accessActivated}` : t.checkout.mockPayment}
              </CardTitle>
              <CardDescription>
                {success
                  ? t.checkout.redirecting
                  : t.checkout.mockPaymentDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {success ? (
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t.checkout.accessCode}</p>
                    <p className="font-mono text-sm font-bold break-all">{accessCode || useInstitutionStore.getState().accessCode}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Plan details */}
                  <div className="bg-secondary/30 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t.checkout.institutionalPlan}</span>
                      <Badge variant="secondary">{t.checkout.annual}</Badge>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/40 pt-3">
                      <span className="font-semibold">{t.checkout.total}</span>
                      <span className="text-2xl font-bold text-primary">0 €</span>
                    </div>
                  </div>

                  {/* What's included */}
                  <ul className="space-y-2">
                    {[
                      t.checkout.benefit1,
                      t.checkout.benefit2,
                      t.checkout.benefit3,
                      t.checkout.benefit4,
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
                        {t.checkout.processing}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        {t.checkout.simulatePayment}
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    {t.checkout.noRealTransaction}
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
