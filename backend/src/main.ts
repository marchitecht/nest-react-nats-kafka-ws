import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Подключаем cookie parser
  app.use(cookieParser());

  // Настройка CORS
  app.enableCors({
    origin: 'http://localhost:5173', // адрес твоего фронта
    credentials: true,               // разрешаем cookie
  });

  // Socket.IO
  const server = await app.listen(3000);
  return server;
}
bootstrap();
