import { Suspense, useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/layout/Layout";
import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { Expenses } from "@/pages/Expenses";
import { Budget } from "@/pages/Budget";
import { Checks } from "@/pages/Checks";
import { Installments } from "@/pages/Installments";
import { Reports } from "@/pages/Reports";
import { Categories } from "@/pages/Categories";
import { Settings } from "@/pages/Settings";
import { Admin } from "@/pages/Admin";
import { supabase } from "@/lib/supabase";
import { getLicense, checkLicenseStatus, createTrialLicense } from "@/lib/license";
import { LicenseModal } from "@/components/license/LicenseModal";
import { WelcomeModal } from "@/components/license/WelcomeModal";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { Session } from "@supabase/supabase-js";
import type { LicenseStatus } from "@/types/license";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { toast } = useToast();

  const checkUserLicense = useCallback(async (userId: string) => {
    setLicenseLoading(true);
    try {
      let license = await getLicense(userId);
      
      // If no license exists, create a trial license and show welcome
      if (!license) {
        license = await createTrialLicense(userId);
        if (license) {
          setIsFirstVisit(true);
          setShowWelcomeModal(true);
        }
      }
      
      // If still no license (database error), create a default valid status
      if (!license) {
        console.warn('Could not get/create license, using default trial');
        const defaultStatus: LicenseStatus = {
          isValid: true,
          licenseType: 'trial',
          daysRemaining: 3,
          message: 'دوره آزمایشی'
        };
        setLicenseStatus(defaultStatus);
        // Don't show welcome modal on error - just let them use the app
        setLicenseLoading(false);
        return;
      }
      
      const status = checkLicenseStatus(license);
      setLicenseStatus(status);
      
      // Show modal only if license is expired (after 3 days trial)
      if (!status.isValid) {
        setShowLicenseModal(true);
      }
    } catch (error) {
      console.error('License check error:', error);
      // Fallback to valid trial on error - let user use the app
      const defaultStatus: LicenseStatus = {
        isValid: true,
        licenseType: 'trial',
        daysRemaining: 3,
        message: 'دوره آزمایشی'
      };
      setLicenseStatus(defaultStatus);
    } finally {
      setLicenseLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user?.id) {
        checkUserLicense(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle email confirmation
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        // Check if this is a fresh email confirmation (user just confirmed their email)
        const confirmedAt = new Date(session.user.email_confirmed_at);
        const now = new Date();
        const timeDiff = now.getTime() - confirmedAt.getTime();
        
        // If confirmed within the last 30 seconds, show success message
        if (timeDiff < 30000) {
          toast({
            title: '✅ ایمیل تایید شد',
            description: 'ایمیل شما با موفقیت تایید شد. خوش آمدید!',
          });
        }
      }
      
      setSession(session);
      if (session?.user?.id) {
        checkUserLicense(session.user.id);
      } else {
        setLicenseStatus(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, [checkUserLicense, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        </div>
      }>
        <Routes>
          {!session ? (
            <>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          ) : licenseStatus && !licenseStatus.isValid && !showWelcomeModal ? (
            // License expired - show only license modal
            <>
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
                  <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">دوره آزمایشی به پایان رسید</h1>
                    <p className="text-gray-600 mb-6">برای ادامه استفاده از برنامه، لطفاً لایسنس خود را فعال کنید.</p>
                  </div>
                </div>
              } />
            </>
          ) : (
            <>
              <Route path="/auth" element={<Navigate to="/" replace />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/checks" element={<Checks />} />
                <Route path="/installments" element={<Installments />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
            </>
          )}
        </Routes>
        
        {/* License Modal */}
        {session && licenseStatus && (
          <LicenseModal
            open={showLicenseModal}
            onOpenChange={setShowLicenseModal}
            licenseStatus={licenseStatus}
            userId={session.user.id}
            onLicenseActivated={() => {
              if (session?.user?.id) {
                checkUserLicense(session.user.id);
              }
            }}
          />
        )}

        {/* Welcome Modal for First Visit */}
        {session && licenseStatus && (
          <WelcomeModal
            open={showWelcomeModal}
            onOpenChange={setShowWelcomeModal}
            licenseStatus={licenseStatus}
            userId={session.user.id}
            userName={session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'کاربر'}
            onActivateLicense={() => {
              setShowWelcomeModal(false);
              setShowLicenseModal(true);
            }}
          />
        )}
      </Suspense>
      <Toaster />
    </AppProvider>
  );
}

export default App;
