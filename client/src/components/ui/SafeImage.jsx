import { useState } from 'react';

// An image that simply disappears if it cannot be loaded (deleted, blocked, offline), instead of showing a broken-picture icon.
// It remembers WHICH address failed, so a different address gets a fresh chance. Loads lazily, off the main thread.
// `alt` is empty by default (decorative). Pass real text when the picture carries information.
export default function SafeImage({ src, alt = '', className, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return null;

  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} className={className} {...props} />;
}
