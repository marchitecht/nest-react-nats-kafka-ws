import { Module } from '@nestjs/common';
import { NatsModule } from './nats/nats.module';
import { HistoryModule } from './history/history.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HistoryService } from './history/history.service';
import { SocketModule } from './socket/socket.module';

@Module({
imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    HistoryModule,
    NatsModule,
    SocketModule

  ],
providers: [ HistoryService],
})
export class AppModule {}
