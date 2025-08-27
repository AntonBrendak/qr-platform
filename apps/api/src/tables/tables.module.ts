import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { RolesGuard } from '../rbac/roles.guard.js';
import { TablesService } from './tables.service.js';
import { TablesAdminController } from './tables.admin.controller.js';

@Module({
  controllers: [TablesAdminController], // /v1/admin/tenants/:tenantId/locations/:locationId/tables
  providers: [TablesService, PrismaService, RolesGuard],
  exports: [TablesService],
})
export class TablesModule {}