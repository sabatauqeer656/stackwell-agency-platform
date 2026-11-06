const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// Turns a date into "5 minutes ago", "yesterday", "3 days ago"...
// For anything older than a month it falls back to a plain date.
export function timeAgo(value) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000); // negative = in the past
  const steps = [
    ['minute', 60],
    ['hour', 3600],
    ['day', 86400],
  ];
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';
  if (abs >= 30 * 86400) return formatDate(value);
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const [unit, size] = steps[i];
    if (abs >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

// 302 -> "302 B", 20480 -> "20 KB", 3145728 -> "3.0 MB"
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
