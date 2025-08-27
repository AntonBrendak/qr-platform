import 'dotenv/config'; // грузим переменные из .env до старта Nest
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js'; // ESM: у локальных импортов обязательно .js
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // буферим логи до инициализации pino-логгера
  });

  // Подключаем pino-логгер, сконфигурированный в AppModule через nestjs-pino
  app.useLogger(app.get(Logger));

  // Глобальная валидация DTO 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // выбрасывает поля, которых нет в DTO
      transform: true,           // преобразует типы по классам DTO
      forbidUnknownValues: false // мягче к неизвестным структурам
    }),
  );

  // Swagger (/docs)
  const cfg = new DocumentBuilder()
    .setTitle('Cafe QR Platform API')
    .setDescription('Phase 0: health & readiness')
    .setVersion('0.0.1')
    .build();

  const doc = SwaggerModule.createDocument(app, cfg);
  SwaggerModule.setup('docs', app, doc);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`API listening on http://localhost:${port}  (docs: /docs)`);
}

bootstrap();