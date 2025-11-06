// src/nats/nats.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, StringCodec, NatsConnection } from 'nats.ws';
import { HistoryService } from '../history/history.service';
import { v4 as uuidv4 } from 'uuid';
import type { Message, StateDTO } from 'src/dto/state.dto';

@Injectable()
export class NatsService implements OnModuleInit {
  private nc: NatsConnection;
  private readonly sc = StringCodec();
  private readonly logger = new Logger(NatsService.name);

  constructor(private readonly historyService: HistoryService) {}

  async onModuleInit() {
    this.nc = await connect({ servers: 'ws://localhost:9222' });
    this.logger.log('✅ Connected to NATS WS');

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

        // Отправляем только конкретному пользователю
        this.historyService.addLive(data.email, msg);
      }
    })();
  }
  getState() {
    // Можно вернуть сводку по всем пользователям (например, для админа)
    const all = this.historyService.getAll();
    return all;
  }
}
