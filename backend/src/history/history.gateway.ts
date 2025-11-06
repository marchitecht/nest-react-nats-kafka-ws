// src/history/history.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { HistoryService } from './history.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class HistoryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly historyService: HistoryService,
    private readonly jwtService: JwtService
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.cookie
        ?.split('; ')
        .find(c => c.startsWith('jwt='))
        ?.split('=')[1];
             
      if (!token) {
        client.disconnect();
        return;
      }
      const user = this.jwtService.verify(token);
      client.data.user = user;

      // Регистрируем сокет пользователя
      this.historyService.registerUser(user.email, client);
      console.log('✅ WS connected:', user.email);

      // Отправляем историю
      const history = this.historyService.getUserHistory(user.email);
      client.emit('history', history);
    } catch (e) {
      console.log('❌ Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user?.email) {
      this.historyService.unregisterUser(user.email);
    }
  }

  afterInit() {
    this.historyService.setSocketServer(this.server);
  }
}
