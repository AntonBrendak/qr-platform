import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { RolesGuard } from '../rbac/roles.guard.js';
import { LocationsService } from './locations.service.js';
import { LocationsAdminController } from './locations.admin.controller.js';

@Module({
  controllers: [LocationsAdminController], 
  providers: [LocationsService, PrismaService, RolesGuard],
  exports: [LocationsService],
})
export class LocationsModule {}