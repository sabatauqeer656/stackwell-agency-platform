// The choices shown in the quote wizard. The `value`s must match the server's allowed values
// (server/src/constants/leads.js); the labels and descriptions are what the visitor reads.

export const projectTypes = [
  { value: 'web-app', label: 'Web application', description: 'Dashboards, portals, SaaS products' },
  { value: 'mobile-app', label: 'Mobile app', description: 'iOS and Android apps' },
  { value: 'ecommerce', label: 'E-commerce store', description: 'Online shop, payments, inventory' },
  { value: 'ui-ux', label: 'UI/UX design', description: 'Research, prototypes, design systems' },
  { value: 'api-backend', label: 'API or backend', description: 'Integrations, databases, cloud' },
  { value: 'maintenance', label: 'Maintenance and support', description: 'Updates for an existing product' },
  { value: 'other', label: 'Something else', description: 'Tell us more in the next steps' },
];

export const budgetRanges = [
  { value: 'under-5k', label: 'Under $5,000' },
  { value: '5k-15k', label: '$5,000 to $15,000' },
  { value: '15k-50k', label: '$15,000 to $50,000' },
  { value: '50k-100k', label: '$50,000 to $100,000' },
  { value: 'over-100k', label: 'Over $100,000' },
  { value: 'not-sure', label: 'Not sure yet', description: 'We can help you scope it' },
];

export const timelines = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-3-months', label: '1 to 3 months' },
  { value: '3-6-months', label: '3 to 6 months' },
  { value: '6-plus-months', label: 'More than 6 months' },
  { value: 'flexible', label: 'Flexible' },
];

// When a visitor arrives from a service page (/quote?service=mobile-app-development),
// the matching project type is pre-selected for them.
export const projectTypeForService = {
  'custom-web-applications': 'web-app',
  'mobile-app-development': 'mobile-app',
  'ecommerce-solutions': 'ecommerce',
  'ui-ux-design': 'ui-ux',
  'api-backend-development': 'api-backend',
  'maintenance-support': 'maintenance',
};

export const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? '';

// The ?service= value comes from the address bar, which anyone can edit, so it is checked before use.
export const isSlug = (value) => typeof value === 'string' && value.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
