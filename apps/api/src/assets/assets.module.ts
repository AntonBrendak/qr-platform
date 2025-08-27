import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { RolesGuard } from '../rbac/roles.guard.js';
import { AssetsService } from './assets.service.js';
import { AssetsAdminController } from './assets.admin.controller.js';

@Module({
  controllers: [AssetsAdminController], // /v1/admin/tenants/:tenantId/assets
  providers: [AssetsService, PrismaService, RolesGuard],
  exports: [AssetsService],
})
export class AssetsModule {}