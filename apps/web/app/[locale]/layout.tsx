import '../../src/styles/bootstrap.scss';

import type {Metadata, Viewport} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {UIProvider} from '../../src/shared/providers/UIProvider';

import {locales, type Locale, defaultLocale} from '../../src/i18n/locales';
import {allMessages} from '../../src/i18n/messages';

export const metadata: Metadata = {
  title: 'QR Café — Web',
  description: 'Customer/Admin/Waiter/Kitchen in one Next.js app',
  manifest: '/manifest.webmanifest'
};

export const viewport: Viewport = {themeColor: '#0d6efd'};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: Locale};
}) {
  const messages = allMessages[locale] ?? allMessages[defaultLocale];

  const tenantThemeCss = `
    :root{
      --qc-color-primary:#0d6efd;
      --qc-color-secondary:#6c757d;
      --qc-color-success:#198754;
      --qc-color-info:#0dcaf0;
      --qc-color-warning:#ffc107;
      --qc-color-danger:#dc3545;
      --qc-color-light:#f8f9fa;
      --qc-color-dark:#212529;
      --qc-text-color:#212529;
      --qc-bg-color:#ffffff;
      --qc-border-color:#dee2e6;
      --qc-radius:.5rem; --qc-radius-sm:.375rem; --qc-radius-lg:.75rem;
      --qc-font-sans:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans','Liberation Sans','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';
    }
  `;

  return (
    <html lang={locale}>
      <head><style id="qc-theme">{tenantThemeCss}</style></head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <UIProvider>{children}</UIProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}