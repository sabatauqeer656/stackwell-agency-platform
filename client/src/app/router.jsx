import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import Home from '../pages/public/Home.jsx';
import Services from '../pages/public/Services.jsx';
import ServiceDetail from '../pages/public/ServiceDetail.jsx';
import Projects from '../pages/public/Projects.jsx';
import ProjectDetail from '../pages/public/ProjectDetail.jsx';
import Solutions from '../pages/public/Solutions.jsx';
import About from '../pages/public/About.jsx';
import Faq from '../pages/public/Faq.jsx';
import SolutionDetail from '../pages/public/SolutionDetail.jsx';
import DesignPreview from '../pages/public/DesignPreview.jsx';
import LayoutPreview from '../pages/public/LayoutPreview.jsx';
import NotFound from '../pages/public/NotFound.jsx';

// URL -> page map. Admin routes are added in Phase 5.
export const router = createBrowserRouter([
  // Every public page renders inside PublicLayout (Navbar + Footer)
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/services', element: <Services /> },
      { path: '/services/:slug', element: <ServiceDetail /> },
      { path: '/projects', element: <Projects /> },
      { path: '/projects/:slug', element: <ProjectDetail /> },
      { path: '/solutions', element: <Solutions /> },
      { path: '/solutions/:slug', element: <SolutionDetail /> },
      { path: '/about', element: <About /> },
      { path: '/faq', element: <Faq /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  // Temporary standalone pages, removed before launch
  { path: '/design-preview', element: <DesignPreview /> },
  { path: '/layout-preview', element: <LayoutPreview /> },
]);
