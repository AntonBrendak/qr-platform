import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

import { RolesGuard } from '../rbac/roles.guard.js';
import { Roles } from '../rbac/roles.decorator.js';
import { Role } from '../rbac/roles.enum.js';
import { TablesService } from './tables.service.js';

class CreateTableDto {
  @IsString()
  @MinLength(1)
  number!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

class UpdateTableDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  number?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

/**
 * Админ-контур столиков в рамках ЛОКАЦИИ.
 * База: /v1/admin/tenants/:tenantId/locations/:locationId/tables
 *
 * Роли:
 *  - GET: owner, manager, waiter, kitchen (чтение).
 *  - POST/PATCH/DELETE/rotate: owner, manager (управление).
 */
@ApiTags('Tables (Admin)')
@Controller('v1/admin/tenants/:tenantId/locations/:locationId/tables')
@UseGuards(RolesGuard)
export class TablesAdminController {
  constructor(private readonly service: TablesService) {}

  @Get()
  @Roles(Role.owner, Role.manager, Role.waiter, Role.kitchen)
  @ApiOperation({ summary: 'List tables in location (scoped to tenant)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  list(@Param('tenantId') tenantId: string, @Param('locationId') locationId: string) {
    return this.service.list(tenantId, locationId);
  }

  @Get(':tableId')
  @Roles(Role.owner, Role.manager, Role.waiter, Role.kitchen)
  @ApiOperation({ summary: 'Get table by id (scoped to tenant & location)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  @ApiParam({ name: 'tableId', required: true })
  get(
    @Param('tenantId') tenantId: string,
    @Param('locationId') locationId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.service.get(tenantId, locationId, tableId);
  }

  @Post()
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Create table in location (scoped to tenant)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  create(
    @Param('tenantId') tenantId: string,
    @Param('locationId') locationId: string,
    @Body() dto: CreateTableDto,
  ) {
    return this.service.create(tenantId, locationId, dto);
  }

  @Patch(':tableId')
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Update table (scoped to tenant & location)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  @ApiParam({ name: 'tableId', required: true })
  update(
    @Param('tenantId') tenantId: string,
    @Param('locationId') locationId: string,
    @Param('tableId') tableId: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.service.update(tenantId, locationId, tableId, dto);
  }

  @Delete(':tableId')
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Delete table (scoped to tenant & location)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  @ApiParam({ name: 'tableId', required: true })
  remove(
    @Param('tenantId') tenantId: string,
    @Param('locationId') locationId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.service.remove(tenantId, locationId, tableId);
  }

  @Post(':tableId/rotate-qr-salt')
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Rotate QR salt for table (prep for Phase 5)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  @ApiParam({ name: 'tableId', required: true })
  rotateQrSalt(
    @Param('tenantId') tenantId: string,
    @Param('locationId') locationId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.service.rotateQrSalt(tenantId, locationId, tableId);
  }
}