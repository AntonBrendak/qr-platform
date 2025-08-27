export const locales = ['en', 'ru', 'de'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';