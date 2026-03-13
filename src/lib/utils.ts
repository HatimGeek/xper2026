import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Public URL builder for Supabase storage (media bucket)
export const getPublicMediaUrl = (filePath: string) =>
  `https://whsxgofhinunbcotwnro.supabase.co/storage/v1/object/public/media/${filePath}`;

export const isImage = (mime?: string | null) => !!mime && mime.startsWith('image/');
export const isVideo = (mime?: string | null) => !!mime && mime.startsWith('video/');
