import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../rbac/roles.guard.js';
import { Roles } from '../rbac/roles.decorator.js';
import { Role } from '../rbac/roles.enum.js';
import { TenantsService } from './tenants.service.js';

type Locale = 'de' | 'en' | 'ru';

class CreateTenantDto {
  name!: string;
  domain?: string | null;
  defaultLocale?: Locale;
}

class UpdateTenantDto {
  name?: string;
  domain?: string | null;
  defaultLocale?: Locale;
}

/**
 * Админ-контроллер для управления арендаторами платформы.
 * База: /v1/admin/tenants
 *
 * ВАЖНО: выбор языка клиентом на витрине — независим от defaultLocale тенанта.
 * Здесь мы только задаём fallback бренда; админ/кухня используют свой UX-язык (позже — user.locale).
 */
@ApiTags('Tenants (Admin)')
@Controller('v1/admin/tenants')
@UseGuards(RolesGuard)
export class TenantsAdminController {
  constructor(private readonly service: TenantsService) {}

  @Post()
  @Roles(Role.owner) // временно: используем "owner" как админ-роль (Phase 2 заменим на JWT/реальные роли)
  @ApiOperation({ summary: 'Create tenant (admin)' })
  create(@Body() body: CreateTenantDto) {
    const { name, domain = null, defaultLocale = 'de' } = body;
    return this.service.create({ name, domain, defaultLocale });
  }

  @Get()
  @Roles(Role.owner)
  @ApiOperation({ summary: 'List tenants (admin)' })
  list() {
    return this.service.list();
  }

  @Get(':tenantId')
  @Roles(Role.owner)
  @ApiOperation({ summary: 'Get tenant by id (admin)' })
  @ApiParam({ name: 'tenantId', required: true })
  get(@Param('tenantId') tenantId: string) {
    return this.service.get(tenantId);
  }

  @Patch(':tenantId')
  @Roles(Role.owner)
  @ApiOperation({ summary: 'Update tenant (admin)' })
  update(@Param('tenantId') tenantId: string, @Body() body: UpdateTenantDto) {
    return this.service.update(tenantId, body);
  }

  @Delete(':tenantId')
  @Roles(Role.owner)
  @ApiOperation({ summary: 'Delete tenant (admin)' })
  remove(@Param('tenantId') tenantId: string) {
    return this.service.remove(tenantId);
  }
}