import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { HealthController } from './health/health.controller.js';
import { HealthService } from './health/health.service.js';
import { TenantsModule } from './tenants/tenants.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { TablesModule } from './tables/tables.module.js'; 
import { ThemesModule } from './themes/themes.module.js';
import { AssetsModule } from './assets/assets.module.js';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    TenantsModule,   // /v1/admin/tenants и /v1/tenants
    LocationsModule, // /v1/admin/tenants/:tenantId/locations
    TablesModule,    // /v1/admin/tenants/:tenantId/locations/:locationId/tables
    ThemesModule,    // /v1/admin/tenants/:tenantId/theme
    AssetsModule,    // /v1/admin/tenants/:tenantId/assets
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
        autoLogging: {
          // Всегда возвращаем boolean
          ignore: (req) => {
            const url = req.url ?? '';
            return url === '/health' || url === '/ready' || url.startsWith('/docs');
          },
        },
      },
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}