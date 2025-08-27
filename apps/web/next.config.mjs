import createNextIntlPlugin from 'next-intl/plugin';

/** 
 * Указываем явный путь к конфигу запросов i18n, чтобы build не искал сам.
 * Файл у нас лежит в src/i18n/request.ts
 */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {typedRoutes: true},

  async headers() {
    return [
      {
        source: '/manifest.webmanifest',
        headers: [
          {key: 'Content-Type', value: 'application/manifest+json'},
          {key: 'Cache-Control', value: 'public, max-age=0, must-revalidate'}
        ]
      },
      {source: '/sw.js', headers: [{key: 'Cache-Control', value: 'no-store'}]}
    ];
  }
};

export default withNextIntl(nextConfig);