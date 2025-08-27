import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator.js';
import { Role } from './roles.enum.js';

/**
 * RolesGuard — временная RBAC до  (JWT).
 * Источник роли: HTTP header "x-role: owner|manager|waiter|kitchen|guest".
 *
 * Поведение:
 * - Если эндпоинт НЕ требует ролей → доступ разрешён.
 * - Если требуются роли, но заголовок пуст → 400 Bad Request.
 * - Если роль не входит в требуемые → 403 Forbidden.
 * - В non-production окружениях допускается dev-значение по умолчанию через
 *   RBAC_DEV_DEFAULT_ROLE (например, "owner"); если не задано — нет дефолта.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // Эндпоинт не ограничен ролями — пропускаем.
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const header = (req.headers?.['x-role'] ?? req.headers?.['X-Role']) as
      | string
      | undefined;

    const envDefault =
      process.env.NODE_ENV !== 'production'
        ? (process.env.RBAC_DEV_DEVFAULT_ROLE ??
           process.env.RBAC_DEV_DEFAULT_ROLE ??
           undefined)
        : undefined;

    const roleStr = (header ?? envDefault)?.toString().trim();
    if (!roleStr) {
      throw new BadRequestException(
        'Missing role: provide "x-role" header (owner|manager|waiter|kitchen|guest)',
      );
    }

    // Нормализуем и валидируем значение.
    const role = roleStr.toLowerCase() as Role;
    const all = Object.values(Role) as Role[];
    if (!all.includes(role)) {
      throw new BadRequestException(
        `Invalid x-role "${roleStr}". Allowed: ${all.join(', ')}`,
      );
    }

    // Проверяем, подходит ли роль требованиям эндпоинта.
    if (!required.includes(role)) {
      throw new ForbiddenException('Insufficient role');
    }

    // Прокинем роль в req.user-like для последующих слоёв (на будущее).
    req.user = { ...(req.user ?? {}), role };

    return true;
  }
}