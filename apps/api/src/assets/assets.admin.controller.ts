import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { AssetKind } from '@prisma/client';

import { RolesGuard } from '../rbac/roles.guard.js';
import { Roles } from '../rbac/roles.decorator.js';
import { Role } from '../rbac/roles.enum.js';
import { AssetsService } from './assets.service.js';

class CreateAssetDto {
  @IsEnum(AssetKind)
  kind!: AssetKind;

  @IsOptional()
  @IsString()
  @MinLength(1)
  filename?: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MinLength(1)
  key?: string;
}

/**
 * Админ-контур ассетов тенанта (метаданные S3/MinIO).
 * База: /v1/admin/tenants/:tenantId/assets
 *
 * READ: owner, manager, waiter, kitchen
 * WRITE/DELETE: owner, manager
 */
@ApiTags('Assets (Admin)')
@Controller('v1/admin/tenants/:tenantId/assets')
@UseGuards(RolesGuard)
export class AssetsAdminController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  @Roles(Role.owner, Role.manager, Role.waiter, Role.kitchen)
  @ApiOperation({ summary: 'List assets of tenant (optional kind filter)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'kind', required: false, enum: AssetKind })
  list(@Param('tenantId') tenantId: string, @Query('kind') kind?: AssetKind) {
    return this.service.list(tenantId, kind);
  }

  @Get(':assetId')
  @Roles(Role.owner, Role.manager, Role.waiter, Role.kitchen)
  @ApiOperation({ summary: 'Get asset by id (scoped to tenant)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'assetId', required: true })
  get(@Param('tenantId') tenantId: string, @Param('assetId') assetId: string) {
    return this.service.get(tenantId, assetId);
  }

  @Post()
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Create asset metadata' })
  @ApiParam({ name: 'tenantId', required: true })
  create(@Param('tenantId') tenantId: string, @Body() dto: CreateAssetDto) {
    return this.service.create(tenantId, dto);
  }

  @Delete(':assetId')
  @Roles(Role.owner, Role.manager)
  @ApiOperation({ summary: 'Delete asset metadata (file removal later)' })
  @ApiParam({ name: 'tenantId', required: true })
  @ApiParam({ name: 'assetId', required: true })
  remove(@Param('tenantId') tenantId: string, @Param('assetId') assetId: string) {
    return this.service.remove(tenantId, assetId);
  }
}
