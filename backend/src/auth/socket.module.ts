// socket.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';
import { HistoryService } from 'src/history/history.service';


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
  ],
  providers: [SocketGateway, HistoryService],
  exports: [SocketGateway, HistoryService],
})
export class SocketModule {}