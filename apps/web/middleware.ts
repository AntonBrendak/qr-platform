import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale, localePrefix} from './src/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix
});

// Матчим всё, кроме статики и API-иконок/манифеста/сервиса
export const config = {
  matcher: [
    // всё приложение
    '/((?!_next|icons|api/pwa/icon/|manifest\\.webmanifest|sw\\.js|.*\\..*).*)'
  ]
};
