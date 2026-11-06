import { Building2, CircleHelp, FileText, FolderKanban, Inbox, LayoutDashboard, Quote, Settings, Users, Wrench } from 'lucide-react';

// The dashboard's menu, in one place. `roles` limits who SEES an item (the API enforces the real rule).
export const navGroups = [
  { label: null, items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    label: 'Leads',
    items: [
      { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
      { to: '/admin/quotes', label: 'Quote requests', icon: FileText },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/services', label: 'Services', icon: Wrench },
      { to: '/admin/solutions', label: 'Solutions', icon: Building2 },
      { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
      { to: '/admin/testimonials', label: 'Testimonials', icon: Quote },
      { to: '/admin/team', label: 'Team', icon: Users },
      { to: '/admin/faqs', label: 'FAQs', icon: CircleHelp },
    ],
  },
  { label: 'Site', items: [{ to: '/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] }] },
];

// The groups a given role may see (empty groups are dropped)
export const navFor = (role) =>
  navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.roles || item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);
