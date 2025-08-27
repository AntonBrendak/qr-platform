import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { AssetKind } from '@prisma/client';

jest.setTimeout(60000);

describe('e2e (Tenants → Locations → Tables → Theme → Assets)', () => {
  let app: INestApplication;
  let http: any;

  // ids across the flow
  const ids = {
    tenantId: '',
    locationId: '',
    tableId: '',
    assetId: '',
  };

  // simple random suffix to avoid conflicts
  const suffix = Math.random().toString(36).slice(2, 8);
  const headers = (role: string) => ({ 'x-role': role });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/admin/tenants — create tenant (owner)', async () => {
    const res = await request(http)
      .post('/v1/admin/tenants')
      .set(headers('owner'))
      .send({
        name: `Test Cafe ${suffix}`,
        domain: `test-${suffix}.example.com`,
        defaultLocale: 'de',
      })
      .expect(201);

    expect(res.body?.id).toBeDefined();
    expect(res.body?.name).toContain('Test Cafe');
    ids.tenantId = res.body.id;
  });

  it('GET /v1/tenants/:tenantId — public tenant read', async () => {
    const res = await request(http)
      .get(`/v1/tenants/${ids.tenantId}`)
      .expect(200);

    expect(res.body?.id).toBe(ids.tenantId);
    expect(res.body?.defaultLocale).toBeDefined();
  });

  it('POST /v1/admin/tenants/:tenantId/locations — create location (owner)', async () => {
    const res = await request(http)
      .post(`/v1/admin/tenants/${ids.tenantId}/locations`)
      .set(headers('owner'))
      .send({ name: `Main Hall ${suffix}`, address: 'Some street, 1' })
      .expect(201);

    expect(res.body?.id).toBeDefined();
    ids.locationId = res.body.id;
  });

  it('POST /v1/admin/tenants/:tenantId/locations/:locationId/tables — create table (owner)', async () => {
    const res = await request(http)
      .post(
        `/v1/admin/tenants/${ids.tenantId}/locations/${ids.locationId}/tables`,
      )
      .set(headers('owner'))
      .send({ number: 'A1' })
      .expect(201);

    expect(res.body?.id).toBeDefined();
    ids.tableId = res.body.id;
  });

  it('GET /tables (waiter) — list tables for location (read access)', async () => {
    const res = await request(http)
      .get(
        `/v1/admin/tenants/${ids.tenantId}/locations/${ids.locationId}/tables`,
      )
      .set(headers('waiter'))
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]?.number).toBeDefined();
  });

  it('GET /tables/:tableId (kitchen) — read one table', async () => {
    const res = await request(http)
      .get(
        `/v1/admin/tenants/${ids.tenantId}/locations/${ids.locationId}/tables/${ids.tableId}`,
      )
      .set(headers('kitchen'))
      .expect(200);

    expect(res.body?.id).toBe(ids.tableId);
  });

  it('POST /tables/:tableId/rotate-qr-salt (owner)', async () => {
    await request(http)
      .post(
        `/v1/admin/tenants/${ids.tenantId}/locations/${ids.locationId}/tables/${ids.tableId}/rotate-qr-salt`,
      )
      .set(headers('owner'))
      .expect(201);
  });

  it('GET /v1/admin/tenants/:tenantId/theme — read theme (manager)', async () => {
    const res = await request(http)
      .get(`/v1/admin/tenants/${ids.tenantId}/theme`)
      .set(headers('manager'))
      .expect(200);

    expect(res.body['--color-primary']).toBeDefined();
  });

  it('PATCH /v1/admin/tenants/:tenantId/theme — patch tokens (manager)', async () => {
    const res = await request(http)
      .patch(`/v1/admin/tenants/${ids.tenantId}/theme`)
      .set(headers('manager'))
      .send({ '--radius-md': '10px' })
      .expect(200);

    expect(res.body['--radius-md']).toBe('10px');
  });

  it('POST /v1/admin/tenants/:tenantId/assets — create asset (manager)', async () => {
    const res = await request(http)
      .post(`/v1/admin/tenants/${ids.tenantId}/assets`)
      .set(headers('manager'))
      .send({
        kind: AssetKind.logo,
        filename: `logo-${suffix}.png`,
        contentType: 'image/png',
        size: 12345,
        meta: { alt: 'Brand logo' },
      })
      .expect(201);

    expect(res.body?.id).toBeDefined();
    expect(res.body?.tenantId).toBe(ids.tenantId);
    ids.assetId = res.body.id;
  });

  it('GET /v1/admin/tenants/:tenantId/assets (kitchen) — list readable assets', async () => {
    const res = await request(http)
      .get(`/v1/admin/tenants/${ids.tenantId}/assets?kind=${AssetKind.logo}`)
      .set(headers('kitchen'))
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: any) => a.id === ids.assetId)).toBe(true);
  });

  it('GET /v1/admin/tenants/:tenantId/assets/:assetId (waiter) — get one asset', async () => {
    const res = await request(http)
      .get(`/v1/admin/tenants/${ids.tenantId}/assets/${ids.assetId}`)
      .set(headers('waiter'))
      .expect(200);

    expect(res.body?.id).toBe(ids.assetId);
  });

  it('DELETE /v1/admin/tenants/:tenantId/assets/:assetId (owner)', async () => {
    await request(http)
      .delete(`/v1/admin/tenants/${ids.tenantId}/assets/${ids.assetId}`)
      .set(headers('owner'))
      .expect(200);
  });
});