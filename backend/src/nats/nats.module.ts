import { Module } from '@nestjs/common';
import { NatsService } from './nats.service';
import { NatsController } from './nats.controller';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [HistoryModule],
  providers: [NatsService],
  controllers: [NatsController],
})
export class NatsModule {}
