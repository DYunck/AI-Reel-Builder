import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewProjectPage } from '@/pages/NewProjectPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { WizardPage } from '@/pages/WizardPage';

/**
 * Routes
 *   /                        Dashboard
 *   /projects                All Reels (search + status filter)
 *   /projects/new            Creates a draft, then opens step 1
 *   /projects/:id            Resumes at the furthest step reached
 *   /projects/:id/:step      Wizard step: idea | script | voice | scenes | build | review | publish
 *   /settings                Theme + data storage
 */
// Embedded hosts that control the page URL (e.g. a sandboxed preview) can build
// with VITE_ROUTER=memory to keep navigation inside the app.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter;

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
            <Route path="projects/:id" element={<WizardPage />} />
            <Route path="projects/:id/:step" element={<WizardPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </ConfirmProvider>
      </Router>
    </ThemeProvider>
  );
}
