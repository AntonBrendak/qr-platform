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
import { IsOptional, IsString, MinLength } from 'class-validator';

import { RolesGuard } from '../rbac/roles.guard.js';
import { Roles } from '../rbac/roles.decorator.js';
import { Role } from '../rbac/roles.enum.js';
import { LocationsService } from './locations.service.js';

class CreateLocationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString() // IANA timezone; строгую валидацию добавим позже
  timezone?: string;
}

class UpdateLocationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

/**
 * Админ-контур локаций, изолирован по tenantId.
 * База: /v1/admin/tenants/:tenantId/locations
 *
 * Роли: owner/manager.
 * Язык витрины клиента здесь не используется — это админские эндпоинты.
 */
@ApiTags('Locations (Admin)')
@Controller('v1/admin/tenants/:tenantId/locations')
@UseGuards(RolesGuard)
export class LocationsAdminController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'List locations of tenant' })
  @ApiParam({ name: 'tenantId', required: true })
  list(@Param('tenantId') tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':locationId')
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Get location by id (scoped to tenant)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  get(@Param('tenantId') tenantId: string, @Param('locationId') locationId: string) {
    return this.service.get(tenantId, locationId);
  }

  @Post()
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Create location for tenant' })
  @ApiParam({ name: 'tenantId', required: true })
  create(@Param('tenantId') tenantId: string, @Body() dto: CreateLocationDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':locationId')
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Update location (scoped to tenant)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  update(
    @Param('tenantId') tenantId: string,
    @Param('locationId') locationId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.service.update(tenantId, locationId, dto);
  }

  @Delete(':locationId')
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Delete location (scoped to tenant)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'locationId', required: true })
  remove(@Param('tenantId') tenantId: string, @Param('locationId') locationId: string) {
    return this.service.remove(tenantId, locationId);
  }
}