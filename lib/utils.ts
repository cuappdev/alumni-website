import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse and return E.164 format, or undefined if unparseable. Defaults to US. */
export function normalizePhone(raw: string): string | undefined {
  const parsed = parsePhoneNumberFromString(raw, "US");
  return parsed?.isValid() ? parsed.number : undefined;
}

/** Format E.164 for display. US numbers → (555) 123-4567, others → international. */
export function formatPhone(e164: string): string {
  const parsed = parsePhoneNumberFromString(e164);
  if (!parsed) return e164;
  return parsed.country === "US"
    ? parsed.formatNational()
    : parsed.formatInternational();
}

export function classLabel(classYear: number, graduated?: boolean): string {
  const shortYear = String(classYear).slice(-2);
  return graduated ? `Alum '${shortYear}` : `Student '${shortYear}`;
}
