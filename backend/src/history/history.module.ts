// src/history/history.module.ts
import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryGateway } from './history.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
   imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'qwer',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [HistoryService, HistoryGateway],
  exports: [HistoryService],
})
export class HistoryModule {}
