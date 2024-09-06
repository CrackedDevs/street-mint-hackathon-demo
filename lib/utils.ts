import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function NumericUUID(): number {
  let uuid = 0;
  for (let i = 0; i < 10; i++) {
    uuid = uuid * 10 + Math.floor(Math.random() * 10);
  }
  return uuid;
}