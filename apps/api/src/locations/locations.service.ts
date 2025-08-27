import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';

type CreateLocationInput = {
  name: string;
  address?: string | null;
  timezone?: string; // по умолчанию задаётся на уровне схемы: "Europe/Berlin"
};

type UpdateLocationInput = {
  name?: string;
  address?: string | null;
  timezone?: string;
};

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Вернуть список локаций конкретного тенанта */
  list(tenantId: string) {
    return this.prisma.location.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Получить локацию по id в пределах тенанта (404, если чужая или нет) */
  async get(tenantId: string, locationId: string) {
    const loc = await this.prisma.location.findFirst({
      where: { id: locationId, tenantId },
    });
    if (!loc) throw new NotFoundException('Location not found');
    return loc;
  }

  /** Создать локацию в пределах тенанта */
  create(tenantId: string, data: CreateLocationInput) {
    return this.prisma.location.create({
      data: {
        tenantId,
        name: data.name,
        address: data.address ?? null,
        timezone: (data.timezone ?? undefined) as any, // оставляем дефолт БД, если не задан
      },
    });
  }

  /** Обновить локацию (строгий скоуп по tenantId) */
  async update(tenantId: string, locationId: string, data: UpdateLocationInput) {
    // гарантируем принадлежность локации тенанту
    await this.ensureOwned(tenantId, locationId);

    return this.prisma.location.update({
      where: { id: locationId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.timezone !== undefined ? { timezone: data.timezone } : {}),
      },
    });
  }

  /** Удалить локацию (строгий скоуп по tenantId) */
  async remove(tenantId: string, locationId: string) {
    await this.ensureOwned(tenantId, locationId);
    return this.prisma.location.delete({ where: { id: locationId } });
  }

  // ——— private ———

  private async ensureOwned(tenantId: string, locationId: string) {
    const exists = await this.prisma.location.findFirst({
      where: { id: locationId, tenantId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Location not found');
  }
}