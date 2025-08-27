import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum.js';

/** Ключ метаданных, под которым храним список требуемых ролей */
export const ROLES_KEY = 'roles' as const;

/** Декоратор для методов/классов контроллера: @Roles(Role.owner, Role.manager) */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);