import 'dotenv/config'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js'; 
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from './common/prisma.service.js'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, 
  });

  app.useLogger(app.get(Logger));

  // Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // выбрасывает поля, которых нет в DTO
      transform: true,           // преобразует типы по классам DTO
      forbidUnknownValues: false // мягче к неизвестным структурам
    }),
  );

  app.enableCors({ origin: true, credentials: true });

  const cfg = new DocumentBuilder()
    .setTitle('Cafe QR Platform API')
    .setDescription(
      'Tenants + Admin/Public. Язык меню клиента выбирается per-request и НЕ влияет на админ/кухню.',
    )
    .setVersion('1.0.0')
    .addBearerAuth() // подготовка к Phase 2 (JWT)
    .build();

  const doc = SwaggerModule.createDocument(app, cfg);
  SwaggerModule.setup('docs', app, doc);

  // ✅ корректное завершение соединений Prisma
  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`API listening on http://localhost:${port}  (docs: /docs)`);
}

bootstrap();