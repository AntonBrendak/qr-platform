import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service.js';
import type { HealthPayload, ReadyPayload } from './health.service.js';

@ApiTags('ops')
@Controller()
export class HealthController {
  constructor(private readonly svc: HealthService) {}

  @Get('/health')
  @ApiOkResponse({
    description: 'Liveness probe',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        ts: { type: 'string', format: 'date-time' },
        uptimeMs: { type: 'integer', example: 12345 },
        pid: { type: 'integer', example: 1234 },
        node: { type: 'string', example: 'v20.11.1' }
      }
    }
  })
  health(): HealthPayload {
    return this.svc.health();
  }

  @Get('/ready')
  @ApiOkResponse({
    description: 'Readiness probe (ready=true → 200)',
    schema: {
      type: 'object',
      properties: {
        ready: { type: 'boolean', example: true },
        ts: { type: 'string', format: 'date-time' },
        memory: {
          type: 'object',
          properties: {
            rss: { type: 'integer', example: 12345678 },
            heapTotal: { type: 'integer', example: 3456789 },
            heapUsed: { type: 'integer', example: 2345678 },
            external: { type: 'integer', example: 123456 },
            arrayBuffers: { type: 'integer', example: 45678 }
          }
        },
        eventLoop: {
          type: 'object',
          properties: {
            meanMs: { type: 'number', example: 2.13 },
            p95Ms: { type: 'number', example: 35.4 }
          }
        },
        cpuCount: { type: 'integer', example: 8 }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Not ready (ready=false → 503)',
    schema: {
      type: 'object',
      properties: {
        ready: { type: 'boolean', example: false },
        ts: { type: 'string', format: 'date-time' },
        memory: {
          type: 'object',
          properties: {
            rss: { type: 'integer', example: 987654321 },
            heapTotal: { type: 'integer', example: 123456789 },
            heapUsed: { type: 'integer', example: 120000000 },
            external: { type: 'integer', example: 123456 },
            arrayBuffers: { type: 'integer', example: 45678 }
          }
        },
        eventLoop: {
          type: 'object',
          properties: {
            meanMs: { type: 'number', example: 50.1 },
            p95Ms: { type: 'number', example: 420.0 }
          }
        },
        cpuCount: { type: 'integer', example: 8 }
      }
    }
  })
  ready(): ReadyPayload {
    const payload = this.svc.ready();
    if (!payload.ready) {
      // Возвращаем корректный HTTP-статус 503 + тело как есть
      throw new ServiceUnavailableException(payload);
    }
    return payload;
  }
}