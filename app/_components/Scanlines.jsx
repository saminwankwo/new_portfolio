'use client';

import { useEffect, useState } from 'react';

/**
 * CRT-style scanlines + vignette overlay.
 *
 * Rendered client-only to avoid SSR paint flicker, and is disabled
 * automatically when the user's OS has `prefers-reduced-motion` enabled
 * (handled by the `.scanlines-overlay` CSS rule in globals.css).
 */
export default function Scanlines() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <div className="scanlines-overlay" aria-hidden="true" />;
}
