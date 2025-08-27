import { Body, Controller, Get, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../rbac/roles.guard.js';
import { Roles } from '../rbac/roles.decorator.js';
import { Role } from '../rbac/roles.enum.js';
import { ThemesService, ThemeTokens } from './themes.service.js';

/**
 * База: /v1/admin/tenants/:tenantId/theme
 *
 * Язык витрины клиента тут не участвует — тема общая для бренда.
 */
@ApiTags('Theme (Admin)')
@Controller('v1/admin/tenants/:tenantId/theme')
@UseGuards(RolesGuard)
export class ThemesAdminController {
  constructor(private readonly service: ThemesService) {}

  @Get()
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Get tenant theme tokens' })
  @ApiParam({ name: 'tenantId', required: true })
  get(@Param('tenantId') tenantId: string) {
    return this.service.get(tenantId);
  }

  @Put()
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Replace theme tokens (PUT)' })
  @ApiParam({ name: 'tenantId', required: true })
  put(@Param('tenantId') tenantId: string, @Body() tokens: ThemeTokens) {
    return this.service.put(tenantId, tokens);
  }

  @Patch()
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Patch theme tokens (add/update/remove by null)' })
  @ApiParam({ name: 'tenantId', required: true })
  patch(
    @Param('tenantId') tenantId: string,
    @Body() delta: Record<string, string | null>,
  ) {
    return this.service.patch(tenantId, delta);
  }
}