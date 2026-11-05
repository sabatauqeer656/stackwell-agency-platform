import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import Home from '../pages/public/Home.jsx';
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
      { path: '*', element: <NotFound /> },
    ],
  },
  // Temporary standalone pages, removed before launch
  { path: '/design-preview', element: <DesignPreview /> },
  { path: '/layout-preview', element: <LayoutPreview /> },
]);
