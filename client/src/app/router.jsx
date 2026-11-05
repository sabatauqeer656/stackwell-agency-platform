import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/public/Home.jsx';
import NotFound from '../pages/public/NotFound.jsx';

// URL -> page map. More public and /admin routes are added in later phases.
export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '*', element: <NotFound /> },
]);
