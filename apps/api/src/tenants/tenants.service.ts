import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Locale } from '@prisma/client';
import { PrismaService } from '../common/prisma.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; 

/**
 * Бизнес-логика арендатора.
 */
@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    domain?: string | null;
    defaultLocale?: Locale;
  }) {
    const normalized = this.normalizeDomain(data.domain);
    try {
      // ✅ Минимальный дифф: создаём тему (1:1) вместе с арендатором
      const tenant = await this.prisma.tenant.create({
        data: {
          name: data.name,
          domain: normalized,
          defaultLocale: data.defaultLocale ?? 'de',
          theme: { create: { tokens: defaultTokens } },
        },
      });
      // Возвращаем тот же объект (без include), чтобы не менять контракт контроллеров
      return tenant;
    } catch (e) {
      this.rethrowKnownErrors(e);
    }
  }

  async list() {
    return this.prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(tenantId: string) {
    const t = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }

  async update(
    tenantId: string,
    data: { name?: string; domain?: string | null; defaultLocale?: Locale },
  ) {
    try {
      return await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.defaultLocale !== undefined
            ? { defaultLocale: data.defaultLocale }
            : {}),
          ...(data.domain !== undefined
            ? { domain: this.normalizeDomain(data.domain) }
            : {}),
        },
      });
    } catch (e) {
      this.rethrowKnownErrors(e, tenantId);
    }
  }

  async remove(tenantId: string) {
    try {
      return await this.prisma.tenant.delete({ where: { id: tenantId } });
    } catch {
      throw new NotFoundException('Tenant not found');
    }
  }

  // ————— private —————

  private normalizeDomain(domain?: string | null) {
    if (domain === undefined) return undefined as unknown as string | null;
    const d = (domain ?? '').trim().toLowerCase();
    return d.length ? d : null;
  }

  private rethrowKnownErrors(e: unknown, id?: string): never {
    if (e instanceof PrismaClientKnownRequestError) {
      // P2002 — unique constraint failed (например, domain)
      if (e.code === 'P2002') {
        throw new ConflictException('Domain is already in use');
      }
      // P2025 — record not found (update/delete)
      if (e.code === 'P2025') {
        throw new NotFoundException(id ? `Tenant ${id} not found` : 'Not found');
      }
    }
    throw e;
  }
}

// Базовые CSS-токены темы (минимальный старт)
const defaultTokens = {
  '--color-primary': '#3b82f6',
  '--color-bg': '#ffffff',
  '--radius-md': '8px',
};