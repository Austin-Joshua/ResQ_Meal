import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Native language names in their respective scripts.
 * These should always be displayed regardless of the current language selection.
 */
export const NATIVE_LANGUAGE_LABELS: Record<'en' | 'ta' | 'hi', string> = {
  en: 'English',
  ta: 'தமிழ்',
  hi: 'हिंदी',
};
