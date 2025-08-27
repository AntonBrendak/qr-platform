import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { HealthController } from './health/health.controller.js';
import { HealthService } from './health/health.service.js';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
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