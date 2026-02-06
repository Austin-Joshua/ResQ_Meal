/**
 * App logo for ResQ Meal. Uses a single image path for frontend and backend.
 * Place your logo at: public/logo.png (recommended 256×256 or 512×512, PNG or JPG).
 * If the file is missing, a placeholder asks you to add it.
 */
import React, { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Canonical logo path: same for frontend (public/logo.png) and backend (e.g. /logo.png in API responses). */
export const APP_LOGO_PATH = '/logo.png';

interface AppLogoProps {
  className?: string;
  alt?: string;
  /** Size context: 'header' (top bar), 'login', 'navbar'. Affects fallback placeholder size. */
  size?: 'header' | 'login' | 'navbar';
  /** Placeholder style when logo is missing: 'dark' = white text (green header), 'light' = dark text (login light bg). */
  placeholderVariant?: 'dark' | 'light';
}

export function AppLogo({ className, alt = 'ResQ Meal', size = 'header', placeholderVariant = 'dark' }: AppLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const sizeClass =
      size === 'login'
        ? 'h-12 w-12'
        : size === 'navbar'
          ? 'h-10 w-10'
          : 'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10';
    const placeStyle =
      placeholderVariant === 'light'
        ? 'border-slate-300 bg-slate-100 text-slate-600'
        : 'border-white/50 bg-white/10 text-white/90';
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed shrink-0',
          placeStyle,
          sizeClass,
          className
        )}
        title="Add your logo: place logo.png in the public folder (see README or public/LOGO_README.txt)"
      >
        <ImagePlus className="h-1/2 w-1/2 min-h-[12px] shrink-0" aria-hidden />
        <span className="text-[0.5rem] sm:text-[0.6rem] leading-tight text-center px-0.5 mt-0.5">Add logo</span>
      </div>
    );
  }

  return (
    <img
      src={APP_LOGO_PATH}
      alt={alt}
      className={cn('object-contain', className)}
      onError={() => setFailed(true)}
    />
  );
}
