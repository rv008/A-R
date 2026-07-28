/** Prefix a public asset path with the configured base path (GitHub Pages project sites). */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const asset = (path: string) => `${BASE}${path}`;
