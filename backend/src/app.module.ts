import { Module } from '@nestjs/common';
import { HistoryModule } from './history/history.module';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [HistoryModule, NatsModule],
})
export class AppModule {}
