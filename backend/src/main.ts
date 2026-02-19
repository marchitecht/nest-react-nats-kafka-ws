import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Разрешаем фронтенду подключаться
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(3001);
  console.log('🚀 Server started on http://localhost:3001');
}
bootstrap();
