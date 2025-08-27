# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /repo

# PNPM для воркспейса
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# Копируем только то, что нужно для быстрой установки зависимостей
# (lockfile обязателен — добьёмся repeatable build)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/

# Устанавливаем deps только для пакета @apps/api (dev+prod)
RUN pnpm install --filter @apps/api... --frozen-lockfile

# Копируем исходники пакета API и сборочные конфиги
COPY apps/api/ apps/api/

# Собираем NestJS (ESM) → dist/
RUN pnpm -C apps/api build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Копируем только необходимое для запуска
COPY --from=build /repo/apps/api/package.json ./
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main.js"]