import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { RolesGuard } from '../rbac/roles.guard.js';
import { ThemesService } from './themes.service.js';
import { ThemesAdminController } from './themes.admin.controller.js';

@Module({
  controllers: [ThemesAdminController], // /v1/admin/tenants/:tenantId/theme
  providers: [ThemesService, PrismaService, RolesGuard],
  exports: [ThemesService],
})
export class ThemesModule {}