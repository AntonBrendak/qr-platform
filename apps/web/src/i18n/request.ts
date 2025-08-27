import {getRequestConfig} from 'next-intl/server';

export const locales = ['de', 'en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const localePrefix = 'always' as const;

async function loadMessages(l: Locale) {
  switch (l) {
    case 'de':
      return (await import('./messages/de.json')).default;
    case 'ru':
      return (await import('./messages/ru.json')).default;
    default:
      return (await import('./messages/en.json')).default;
  }
}

// ВАЖНО: default-export именно этого результата
export default getRequestConfig(async ({locale}) => {
  const l = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const messages = await loadMessages(l);
  // ГАРАНТИРОВАННО возвращаем объект
  return {locale: l, messages};
});