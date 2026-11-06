// How each lead status looks and reads. Shared by every dashboard screen that shows a status.

// Badge variants (see components/ui/Badge.jsx)
export const statusVariant = {
  new: 'brand',
  read: 'neutral',
  replied: 'success',
  archived: 'neutral',
  reviewing: 'warning',
  'proposal-sent': 'brand',
  won: 'success',
  lost: 'danger',
};

export const statusLabel = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
  reviewing: 'Reviewing',
  'proposal-sent': 'Proposal sent',
  won: 'Won',
  lost: 'Lost',
};
