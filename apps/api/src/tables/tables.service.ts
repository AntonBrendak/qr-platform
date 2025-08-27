import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type CreateTableInput = {
  /** Номер/метка столика: "1", "A3", "T-07" */
  number: string;
  /** Активен ли столик (по умолчанию true из схемы) */
  active?: boolean;
};

type UpdateTableInput = {
  number?: string;
  active?: boolean;
};

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Список столиков в ЛОКАЦИИ, с жёстким скоупом по tenantId через relation */
  list(tenantId: string, locationId: string) {
    return this.prisma.table.findMany({
      where: { locationId, location: { tenantId } },
      orderBy: [{ number: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /** Получить столик по id в рамках tenant+location (404, если чужой/нет) */
  async get(tenantId: string, locationId: string, tableId: string) {
    const row = await this.prisma.table.findFirst({
      where: { id: tableId, locationId, location: { tenantId } },
    });
    if (!row) throw new NotFoundException('Table not found');
    return row;
  }

  /** Создать столик в локации арендатора (проверяем, что location принадлежит tenant) */
  async create(tenantId: string, locationId: string, data: CreateTableInput) {
    await this.ensureLocationOwned(tenantId, locationId);
    try {
      return await this.prisma.table.create({
        data: {
          locationId,
          number: data.number.trim(),
          ...(data.active !== undefined ? { active: data.active } : {}),
          // qrSalt генерится дефолтом БД
        },
      });
    } catch (e) {
      this.rethrowKnownErrors(e);
    }
  }

  /** Обновить столик (строгий скоуп tenant→location) */
  async update(
    tenantId: string,
    locationId: string,
    tableId: string,
    data: UpdateTableInput,
  ) {
    await this.ensureOwned(tenantId, locationId, tableId);
    try {
      return await this.prisma.table.update({
        where: { id: tableId },
        data: {
          ...(data.number !== undefined ? { number: data.number.trim() } : {}),
          ...(data.active !== undefined ? { active: data.active } : {}),
        },
      });
    } catch (e) {
      this.rethrowKnownErrors(e);
    }
  }

  /** Удалить столик (строгий скоуп tenant→location) */
  async remove(tenantId: string, locationId: string, tableId: string) {
    await this.ensureOwned(tenantId, locationId, tableId);
    return this.prisma.table.delete({ where: { id: tableId } });
  }

  /** Сменить соль QR  */
  async rotateQrSalt(tenantId: string, locationId: string, tableId: string) {
    await this.ensureOwned(tenantId, locationId, tableId);
    return this.prisma.table.update({
      where: { id: tableId },
      data: { qrSalt: cryptoRandomUUID() },
    });
  }

  // ——— private helpers ———

  /** Проверяем, что локация принадлежит тенанту */
  private async ensureLocationOwned(tenantId: string, locationId: string) {
    const loc = await this.prisma.location.findFirst({
      where: { id: locationId, tenantId },
      select: { id: true },
    });
    if (!loc) throw new NotFoundException('Location not found');
  }

  /** Проверяем, что столик принадлежит локации И та — этому тенанту */
  private async ensureOwned(
    tenantId: string,
    locationId: string,
    tableId: string,
  ) {
    const row = await this.prisma.table.findFirst({
      where: { id: tableId, locationId, location: { tenantId } },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Table not found');
  }

  private rethrowKnownErrors(e: unknown): never {
    if (e instanceof PrismaClientKnownRequestError) {
      // unique(locationId, number)
      if (e.code === 'P2002') {
        throw new ConflictException(
          'Table number already exists in this location',
        );
      }
      if (e.code === 'P2025') {
        throw new NotFoundException('Table not found');
      }
    }
    throw e;
  }
}

// утилита UUID без импорта node:crypto (совместимо с ESM)
function cryptoRandomUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  // fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}