import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Asset, AssetKind, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type CreateAssetInput = {
  kind: AssetKind;
  /** Оригинальное имя файла, влияет на расширение в key */
  filename?: string | null;
  /** MIME типа файла (информативно) */
  contentType?: string | null;
  /** Размер в байтах (информативно) */
  size?: number | null;
  /** Произвольные метаданные (например, {width,height,alt}) */
  meta?: Record<string, unknown> | null;
  /** Необязательный готовый ключ (если уже загружено во внешнее S3) */
  key?: string | null;
};

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Список ассетов тенанта (опциональный фильтр по виду) */
  list(tenantId: string, kind?: AssetKind) {
    return this.prisma.asset.findMany({
      where: { tenantId, ...(kind ? { kind } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Получить ассет по id в скоупе тенанта */
  async get(tenantId: string, assetId: string) {
    const row = await this.prisma.asset.findFirst({
      where: { id: assetId, tenantId },
    });
    if (!row) throw new NotFoundException('Asset not found');
    return row;
  }

  /**
   * Создать метаданные ассета.
   * Если key не задан — сгенерируем безопасный ключ вида:
   *   tenants/{tenantId}/assets/{uuid}[.ext]
   */
  async create(tenantId: string, input: CreateAssetInput): Promise<Asset> {
    const key =
      input.key?.trim() ||
      this.generateKey(tenantId, input.filename ?? undefined);

    try {
      return await this.prisma.asset.create({
        data: {
          tenantId,
          kind: input.kind,
          key,
          filename: input.filename ?? null,
          contentType: input.contentType ?? null,
          size: input.size ?? null,
          ...(input.meta !== undefined
            ? { meta: input.meta as Prisma.InputJsonValue } // ✅ главная правка
            : {}),
        },
      });
    } catch (e) {
      this.rethrowKnownErrors(e);
    }
  }

  /** Удалить ассет в скоупе тенанта (только мета; сам файл удалим позже) */
  async remove(tenantId: string, assetId: string) {
    // сначала проверим принадлежность
    await this.ensureOwned(tenantId, assetId);
    return this.prisma.asset.delete({ where: { id: assetId } });
  }

  // ——— helpers ———

  private async ensureOwned(tenantId: string, assetId: string) {
    const row = await this.prisma.asset.findFirst({
      where: { id: assetId, tenantId },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Asset not found');
  }

  private rethrowKnownErrors(e: unknown): never {
    if (e instanceof PrismaClientKnownRequestError) {
      // unique(tenantId, key)
      if (e.code === 'P2002') {
        throw new ConflictException('Asset key already exists for this tenant');
      }
      if (e.code === 'P2025') {
        throw new NotFoundException('Asset not found');
      }
    }
    throw e;
  }

  private generateKey(tenantId: string, filename?: string) {
    const uuid = cryptoRandomUUID();
    const ext = filename ? safeExt(filename) : '';
    return `tenants/${tenantId}/assets/${uuid}${ext}`;
  }
}

/** Безопасное расширение из имени файла */
function safeExt(filename: string): string {
  const m = filename.trim().toLowerCase().match(/\.(?:[a-z0-9]{1,8})$/i);
  if (!m) return '';
  const ext = m[0].replace(/[^a-z0-9.]/g, '');
  // защитимся от "двойных" расширений
  if (ext.includes('..')) return '';
  return ext;
}

// UUID без явного импорта node:crypto (ESM-совместимо)
function cryptoRandomUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}