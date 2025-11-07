// socket.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';
import { HistoryService } from 'src/history/history.service';
import { HistoryModule } from 'src/history/history.module';


@Module({
  imports: [
    HistoryModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'qwer',
    }),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}