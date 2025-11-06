// src/nats/nats.module.ts
import { Module } from '@nestjs/common';
import { NatsService } from './nats.service';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [HistoryModule],
  providers: [NatsService],
  exports: [NatsService],
})
export class NatsModule {}