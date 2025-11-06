import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { NatsService } from './nats.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NatsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly natsService: NatsService) {}

  afterInit() {
  }
}