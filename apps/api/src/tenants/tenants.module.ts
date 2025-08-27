import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { TenantsService } from './tenants.service.js';
import { TenantsAdminController } from './tenants.admin.controller.js';
import { TenantsPublicController } from './tenants.public.controller.js';
import { RolesGuard } from '../rbac/roles.guard.js';

@Module({
  controllers: [TenantsAdminController, TenantsPublicController], // /v1/admin/tenants и /v1/tenants
  providers: [TenantsService, PrismaService, RolesGuard],
  exports: [TenantsService],
})
export class TenantsModule {}