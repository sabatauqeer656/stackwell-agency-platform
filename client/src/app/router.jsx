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
      { path: '/quote', ...page(() => import('../pages/public/Quote.jsx')) },
      { path: '*', element: <NotFound /> },
    ],
  },
  // The admin dashboard. All of it is lazy-loaded, so public visitors never download any of it.
  // AdminRoot provides the login state; RequireAuth guards every page except the login page.
  {
    path: '/admin',
    HydrateFallback: InitialLoading,
    ...page(() => import('../pages/admin/AdminRoot.jsx')),
    children: [
      { path: 'login', ...page(() => import('../pages/admin/Login.jsx')) },
      {
        ...page(() => import('../components/admin/RequireAuth.jsx')),
        children: [
          {
            // The frame (sidebar and top bar) around every dashboard page
            ...page(() => import('../components/admin/AdminLayout.jsx')),
            children: [
              { index: true, ...page(() => import('../pages/admin/Dashboard.jsx')) },
              { path: 'inquiries', ...page(() => import('../pages/admin/Inquiries.jsx')) },
              { path: 'inquiries/:id', ...page(() => import('../pages/admin/InquiryDetail.jsx')) },
              { path: 'quotes', ...page(() => import('../pages/admin/Quotes.jsx')) },
              { path: 'quotes/:id', ...page(() => import('../pages/admin/QuoteDetail.jsx')) },
              { path: 'services', ...page(() => import('../pages/admin/Services.jsx')) },
              { path: 'services/new', ...page(() => import('../pages/admin/ServiceEdit.jsx')) },
              { path: 'services/:id', ...page(() => import('../pages/admin/ServiceEdit.jsx')) },
              { path: 'solutions', ...page(() => import('../pages/admin/Solutions.jsx')) },
              { path: 'solutions/new', ...page(() => import('../pages/admin/SolutionEdit.jsx')) },
              { path: 'solutions/:id', ...page(() => import('../pages/admin/SolutionEdit.jsx')) },
              { path: 'projects', ...page(() => import('../pages/admin/Projects.jsx')) },
              { path: 'projects/new', ...page(() => import('../pages/admin/ProjectEdit.jsx')) },
              { path: 'projects/:id', ...page(() => import('../pages/admin/ProjectEdit.jsx')) },
              { path: 'team', ...page(() => import('../pages/admin/Team.jsx')) },
              { path: 'team/new', ...page(() => import('../pages/admin/TeamEdit.jsx')) },
              { path: 'team/:id', ...page(() => import('../pages/admin/TeamEdit.jsx')) },
              { path: 'testimonials', ...page(() => import('../pages/admin/Testimonials.jsx')) },
              { path: 'testimonials/new', ...page(() => import('../pages/admin/TestimonialEdit.jsx')) },
              { path: 'testimonials/:id', ...page(() => import('../pages/admin/TestimonialEdit.jsx')) },
              { path: 'faqs', ...page(() => import('../pages/admin/Faqs.jsx')) },
              { path: 'faqs/new', ...page(() => import('../pages/admin/FaqEdit.jsx')) },
              { path: 'faqs/:id', ...page(() => import('../pages/admin/FaqEdit.jsx')) },
              // Administrators only: the screen shows "no access" to editors (and the API refuses them anyway)
              {
                ...page(() => import('../components/admin/RequireAdmin.jsx')),
                children: [{ path: 'settings', handle: { title: 'Settings' }, ...page(() => import('../pages/admin/ComingSoon.jsx')) }],
              },
              { path: '*', ...page(() => import('../pages/admin/AdminNotFound.jsx')) },
            ],
          },
        ],
      },
    ],
  },
  // Temporary standalone pages, removed before launch
  { path: '/design-preview', HydrateFallback: InitialLoading, ...page(() => import('../pages/public/DesignPreview.jsx')) },
  { path: '/layout-preview', HydrateFallback: InitialLoading, ...page(() => import('../pages/public/LayoutPreview.jsx')) },
]);
