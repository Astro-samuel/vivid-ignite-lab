import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
<<<<<<< HEAD
import { AuthProvider } from "@/contexts/AuthContext";
import PageTransition from "@/components/PageTransition";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import ProjectSkeleton from "@/components/ProjectSkeleton";
=======
import { I18nextProvider } from "react-i18next";
import i18n from "./locales";
>>>>>>> f1d7728 (Initial commit)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GeneratePage from "./pages/GeneratePage";
import DashboardPage from "./pages/DashboardPage";
import CatalogPage from "./pages/CatalogPage";
import ComponentsPage from "./pages/ComponentsPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";
import ThinkBiggerPage from "./pages/ThinkBiggerPage";
import IDEPage from "./pages/IDEPage";
import KitsPage from "./pages/KitsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
<<<<<<< HEAD
import FeedbackPage from "./pages/FeedbackPage";
import SubmitProjectPage from "./pages/SubmitProjectPage";
import ResourcesPage from "./pages/ResourcesPage";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AISettingsPage from "./pages/AISettingsPage";

const queryClient = new QueryClient();

// Generic page loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(var(--muted))", borderTopColor: "hsl(var(--primary))" }} />
        <span className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Loading...</span>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
        <Route path="/auth" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
        <Route path="/forgot-password" element={<ErrorBoundary><ForgotPasswordPage /></ErrorBoundary>} />
        <Route path="/reset-password" element={<ErrorBoundary><ResetPasswordPage /></ErrorBoundary>} />
        <Route path="/onboarding" element={<ProtectedRoute><ErrorBoundary><OnboardingPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/catalog" element={<ErrorBoundary fallbackTitle="Catalog couldn't load"><CatalogPage /></ErrorBoundary>} />
        <Route path="/dashboard" element={<ProtectedRoute><ErrorBoundary fallbackTitle="Dashboard couldn't load"><DashboardPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/components" element={<ProtectedRoute><ErrorBoundary><ComponentsPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/kits" element={<ProtectedRoute><ErrorBoundary><KitsPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute><ErrorBoundary fallbackTitle="Generator encountered an error"><GeneratePage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/think-bigger" element={<ProtectedRoute><ErrorBoundary><ThinkBiggerPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><ErrorBoundary><AchievementsPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ErrorBoundary><ProfilePage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/ide" element={<ProtectedRoute><ErrorBoundary><IDEPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/project/:id" element={
          <ProtectedRoute>
            <ErrorBoundary fallbackTitle="This project couldn't load">
              <ProjectDetailPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/feedback" element={<ProtectedRoute><ErrorBoundary><FeedbackPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/submit-project" element={<ProtectedRoute><ErrorBoundary><SubmitProjectPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><ErrorBoundary><ResourcesPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/ai-settings" element={<ProtectedRoute><ErrorBoundary><AISettingsPage /></ErrorBoundary></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary fallbackTitle="Application Error">
            <AnimatedRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
=======
import PageWrapper from "./components/PageWrapper";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<PageWrapper><Index /></PageWrapper>}
        />
        <Route
          path="/dashboard"
          element={<PageWrapper><DashboardPage /></PageWrapper>}
        />
        <Route
          path="/catalog"
          element={<PageWrapper><CatalogPage /></PageWrapper>}
        />
        <Route
          path="/components"
          element={<PageWrapper><ComponentsPage /></PageWrapper>}
        />
        <Route path="/kits" element={<PageWrapper><KitsPage /></PageWrapper>} />
        <Route
          path="/generate"
          element={<PageWrapper><GeneratePage /></PageWrapper>}
        />
        <Route
          path="/think-bigger"
          element={<PageWrapper><ThinkBiggerPage /></PageWrapper>}
        />
        <Route
          path="/achievements"
          element={<PageWrapper><AchievementsPage /></PageWrapper>}
        />
        <Route
          path="/profile"
          element={<PageWrapper><ProfilePage /></PageWrapper>}
        />
        <Route path="/ide" element={<PageWrapper><IDEPage /></PageWrapper>} />
        <Route
          path="/project/:id"
          element={<PageWrapper><ProjectDetailPage /></PageWrapper>}
        />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nextProvider>
>>>>>>> f1d7728 (Initial commit)
);

export default App;
