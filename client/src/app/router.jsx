import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import InitialLoading from '../components/layout/InitialLoading.jsx';
import Home from '../pages/public/Home.jsx';
import NotFound from '../pages/public/NotFound.jsx';

// Code splitting: `lazy` loads a page's code only when the visitor first goes there.
// The home page and the layout stay in the main file, because every visit needs them.
// Every other page becomes its own small file that downloads on demand.
const page = (load) => ({
  lazy: async () => ({ Component: (await load()).default }),
});

// URL -> page map. Admin routes are added in Phase 5.
export const router = createBrowserRouter([
  // Every public page renders inside PublicLayout (Navbar + Footer)
  {
    element: <PublicLayout />,
    HydrateFallback: InitialLoading,
    children: [
      { path: '/', element: <Home /> },
      { path: '/services', ...page(() => import('../pages/public/Services.jsx')) },
      { path: '/services/:slug', ...page(() => import('../pages/public/ServiceDetail.jsx')) },
      { path: '/projects', ...page(() => import('../pages/public/Projects.jsx')) },
      { path: '/projects/:slug', ...page(() => import('../pages/public/ProjectDetail.jsx')) },
      { path: '/solutions', ...page(() => import('../pages/public/Solutions.jsx')) },
      { path: '/solutions/:slug', ...page(() => import('../pages/public/SolutionDetail.jsx')) },
      { path: '/about', ...page(() => import('../pages/public/About.jsx')) },
      { path: '/faq', ...page(() => import('../pages/public/Faq.jsx')) },
      { path: '/contact', ...page(() => import('../pages/public/Contact.jsx')) },
      { path: '*', element: <NotFound /> },
    ],
  },
  // Temporary standalone pages, removed before launch
  { path: '/design-preview', HydrateFallback: InitialLoading, ...page(() => import('../pages/public/DesignPreview.jsx')) },
  { path: '/layout-preview', HydrateFallback: InitialLoading, ...page(() => import('../pages/public/LayoutPreview.jsx')) },
]);
