import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, StringCodec, NatsConnection } from 'nats';
import { HistoryService } from '../history/history.service';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from 'src/dto/state.dto';

@Injectable()
export class NatsService implements OnModuleInit {
  private nc: NatsConnection;
  private readonly sc = StringCodec();
  private readonly logger = new Logger(NatsService.name);

  constructor(private readonly historyService: HistoryService) {}

  async onModuleInit() {
    try {
      this.nc = await connect({ servers: 'localhost:4222' });
      this.logger.log('✅ Connected to NATS TCP');

      const sub = this.nc.subscribe('updates.live');
      (async () => {
        for await (const m of sub) {
          let data: any;
          try {
            data = JSON.parse(this.sc.decode(m.data));
          } catch {
            data = this.sc.decode(m.data);
          }

          if (!data.email) {
            this.logger.warn('⚠️ Received message without email, skipping');
            continue;
          }

          const msg: Message = {
            id: uuidv4(),
            ts: new Date().toISOString(),
            body: data,
          };

          // Отправляем live-сообщение пользователю
          this.historyService.addLive(data.email, msg);
        }
      })();
    } catch (err) {
      this.logger.error('❌ NATS connection failed', err);
    }
  }

  async publish(subject: string, payload: any) {
    if (!this.nc) return;
    this.nc.publish(subject, this.sc.encode(JSON.stringify(payload)));
  }

  getState() {
    return this.historyService.getAll();
  }
}
