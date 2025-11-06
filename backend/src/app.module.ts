import { Module } from '@nestjs/common';
import { NatsModule } from './nats/nats.module';
import { HistoryModule } from './history/history.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SocketGateway } from './auth/socket.gateway';
import { HistoryService } from './history/history.service';

@Module({
imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    HistoryModule,
    NatsModule,
  ],
providers: [ HistoryService],
})
export class AppModule {}
