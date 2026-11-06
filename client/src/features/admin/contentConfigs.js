import { useAdminService, useCreateService, useDeleteService, useUpdateService } from './services.js';
import { useAdminSolution, useCreateSolution, useDeleteSolution, useUpdateSolution } from './solutions.js';

// Everything that differs between the Services editor and the Solutions editor, in one place.
// The shared form (components/admin/IconContentEditor.jsx) reads its wording, address and data hooks from here.

export const serviceConfig = {
  noun: 'service',
  Noun: 'Service',
  plural: 'services',
  adminPath: '/admin/services',
  publicPath: '/services',
  defaultIcon: 'Code',
  listKey: 'features', // the API field that holds the list of points
  listItemMax: 120,
  listLabel: 'Key features',
  listHint: 'Short bullet points shown on the service page. Press Enter to add another.',
  listPlaceholder: 'For example: Single-page apps with React',
  listAddLabel: 'Add a feature',
  summaryHint: 'One or two sentences shown on the service cards.',
  descriptionHint: "Shown on the service's own page. A blank line starts a new paragraph.",
  hooks: { useOne: useAdminService, useCreate: useCreateService, useUpdate: useUpdateService, useDelete: useDeleteService },
};

export const solutionConfig = {
  noun: 'solution',
  Noun: 'Solution',
  plural: 'solutions',
  adminPath: '/admin/solutions',
  publicPath: '/solutions',
  defaultIcon: 'Briefcase',
  listKey: 'challenges',
  listItemMax: 200,
  listLabel: 'Challenges we solve',
  listHint: 'Problems this industry faces that you help with. Press Enter to add another.',
  listPlaceholder: 'For example: Meeting strict data-privacy rules',
  listAddLabel: 'Add a challenge',
  summaryHint: 'One or two sentences shown on the solution cards.',
  descriptionHint: "Shown on the solution's own page. A blank line starts a new paragraph.",
  hooks: { useOne: useAdminSolution, useCreate: useCreateSolution, useUpdate: useUpdateSolution, useDelete: useDeleteSolution },
};
