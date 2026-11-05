import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/public/Home.jsx';
import DesignPreview from '../pages/public/DesignPreview.jsx';
import LayoutPreview from '../pages/public/LayoutPreview.jsx';
import NotFound from '../pages/public/NotFound.jsx';

// URL -> page map. More public and /admin routes are added in later phases.
export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/design-preview', element: <DesignPreview /> }, // temporary, removed before launch
  { path: '/layout-preview', element: <LayoutPreview /> }, // temporary, removed before launch
  { path: '*', element: <NotFound /> },
]);
