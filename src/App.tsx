import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/context/LanguageContext";
import logoMark from "@/assets/logo-mark.png";

const ResQMealApp = lazy(() => import("./pages/App"));

const queryClient = new QueryClient();

/** App icon only (no text) shown while the main app bundle lazy-loads */
const LazyLoadFallback = () => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-950 via-blue-950 to-slate-900"
    aria-hidden="true"
  >
    <img
      src={logoMark}
      alt=""
      className="h-20 w-20 animate-pulse object-contain opacity-90"
    />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <Suspense fallback={<LazyLoadFallback />}>
          <ResQMealApp />
        </Suspense>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
