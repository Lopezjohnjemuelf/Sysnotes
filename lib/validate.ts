export function sanitizeString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export function validateSlug(val: string): boolean {
  return /^[a-z0-9-]{1,60}$/.test(val);
}

export function validateUrl(val: string): boolean {
  return val.startsWith("https://");
}

export function sanitizeTags(tags: string[]): string[] {
  return tags
    .slice(0, 10)
    .map((tag) => sanitizeString(tag.replace(/[^a-zA-Z0-9 -]/g, ""), 30))
    .filter(Boolean);
}

export function validateWebhookUrl(val: string): boolean {
  return /^https:\/\/.{4,}/.test(val);
}

export function validateLogoUrl(val: string): boolean {
  return validateUrl(val) || val.startsWith("data:image/");
}
