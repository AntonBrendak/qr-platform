import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';

export type ThemeTokens = Record<string, string>;

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Вернуть токены темы арендатора (404 если арендатор/тема не найдены) */
  async get(tenantId: string): Promise<ThemeTokens> {
    const theme = await this.prisma.theme.findUnique({
      where: { tenantId },
      select: { tokens: true },
    });
    if (!theme) throw new NotFoundException('Theme not found for tenant');
    // Prisma тип JSON → unknown; убеждаемся, что это объект
    return (theme.tokens ?? {}) as ThemeTokens;
  }

  /**
   * Полная замена токенов темы (PUT semantics).
   * Валидируем, что все ключи строковые и начинаются с CSS-переменной `--`.
   */
  async put(tenantId: string, tokens: ThemeTokens): Promise<ThemeTokens> {
    this.validateTokens(tokens);
    const updated = await this.prisma.theme.update({
      where: { tenantId },
      data: { tokens },
      select: { tokens: true },
    });
    return updated.tokens as ThemeTokens;
  }

  /**
   * Частичное обновление токенов (PATCH semantics).
   * Ключ со значением `null` удаляется из набора.
   */
  async patch(
    tenantId: string,
    delta: Record<string, string | null>,
  ): Promise<ThemeTokens> {
    this.validatePatch(delta);
    const current = await this.get(tenantId);
    const next: ThemeTokens = { ...current };
    for (const [k, v] of Object.entries(delta)) {
      if (v === null) delete next[k];
      else next[k] = v;
    }
    const saved = await this.prisma.theme.update({
      where: { tenantId },
      data: { tokens: next },
      select: { tokens: true },
    });
    return saved.tokens as ThemeTokens;
  }

  // ——— helpers ———

  private validateTokens(tokens: ThemeTokens) {
    if (typeof tokens !== 'object' || tokens === null || Array.isArray(tokens)) {
      throw new Error('tokens must be a plain object of CSS variables');
    }
    for (const [k, v] of Object.entries(tokens)) {
      if (typeof k !== 'string' || !k.startsWith('--')) {
        throw new Error(`Invalid token key "${k}" (must start with --)`);
      }
      if (typeof v !== 'string') {
        throw new Error(`Invalid token value for "${k}" (must be string)`);
      }
    }
  }

  private validatePatch(delta: Record<string, string | null>) {
    if (typeof delta !== 'object' || delta === null || Array.isArray(delta)) {
      throw new Error('delta must be a plain object');
    }
    for (const [k, v] of Object.entries(delta)) {
      if (typeof k !== 'string' || !k.startsWith('--')) {
        throw new Error(`Invalid token key "${k}" (must start with --)`);
      }
      if (!(typeof v === 'string' || v === null)) {
        throw new Error(`Invalid token value for "${k}" (must be string|null)`);
      }
    }
  }
}