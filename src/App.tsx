import { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewProjectPage } from '@/pages/NewProjectPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { SettingsPage } from '@/pages/SettingsPage';

/**
 * Routes
 *   /                        Dashboard
 *   /projects                All Reels (search + status filter)
 *   /projects/new            Creates a draft, then opens step 1
 *   /projects/:id            Resumes at the furthest step reached
 *   /projects/:id/:step      Wizard step: idea | script | voice | scenes | build | review | publish
 *   /settings                Theme + data storage
 */
// VITE_ROUTER picks how pages map to URLs:
//   browser (default)  clean URLs; the host must serve index.html for every path
//   hash               /#/projects style URLs for static hosts like GitHub Pages
//   memory             no URL changes, for embedded hosts that own the URL
// The wizard is the largest part of the app, so it loads only when a Reel is opened.
const WizardPage = lazy(() => import('@/pages/WizardPage').then((m) => ({ default: m.WizardPage })));

function WizardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-brand-500" aria-label="Loading" />
    </div>
  );
}

const wizard = (
  <Suspense fallback={<WizardLoading />}>
    <WizardPage />
  </Suspense>
);

const Router =
  import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter;

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ConfirmProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<NewProjectPage />} />
            <Route path="projects/:id" element={wizard} />
            <Route path="projects/:id/:step" element={wizard} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </ConfirmProvider>
      </Router>
    </ThemeProvider>
  );
}
