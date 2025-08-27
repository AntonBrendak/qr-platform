import 'dotenv/config';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module.js'; // ESM: локальный импорт с .js

describe('Health E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init(); // не слушаем порт; supertest будет работать через httpServer
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health → 200 и { status: "ok" }', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptimeMs).toBe('number');
    expect(typeof res.body.pid).toBe('number');
    expect(typeof res.body.node).toBe('string');
  });

  it('GET /ready → 200 или 503, но с корректной формой ответа', async () => {
    const res = await request(app.getHttpServer()).get('/ready');
    expect([200, 503]).toContain(res.status);

    const body = res.body;
    expect(typeof body.ready).toBe('boolean');
    expect(body).toHaveProperty('memory');
    expect(body).toHaveProperty('eventLoop');
    expect(body).toHaveProperty('cpuCount');
  });
});