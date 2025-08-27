import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service.js';

type Locale = 'de' | 'en' | 'ru';

class PublicTenantDto {
  id!: string;
  name!: string;
  defaultLocale!: Locale;
  domain?: string | null;
}

/**
 * Публичные (витринные) эндпоинты арендатора.
 */
@ApiTags('Tenants (Public)')
@Controller('v1/tenants')
export class TenantsPublicController {
  constructor(private readonly service: TenantsService) {}

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get tenant public info by id' })
  @ApiParam({ name: 'tenantId', required: true })
  async getById(@Param('tenantId') tenantId: string): Promise<PublicTenantDto> {
    const t = await this.service.get(tenantId);
    return { id: t.id, name: t.name, defaultLocale: t.defaultLocale as Locale, domain: t.domain ?? null };
  }

  @Get('resolve/by-domain')
  @ApiOperation({ summary: 'Resolve tenant by domain (public)' })
  @ApiQuery({ name: 'domain', required: true, description: 'Custom domain or subdomain' })
  async resolveByDomain(@Query('domain') domain: string): Promise<PublicTenantDto | null> {
    const d = (domain ?? '').trim().toLowerCase();
    if (!d) return null;
    const t = await this.service['prisma'].tenant.findUnique({ where: { domain: d } });
    if (!t) return null;
    return { id: t.id, name: t.name, defaultLocale: t.defaultLocale as Locale, domain: t.domain ?? null };
  }
}