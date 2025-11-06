// socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { HistoryService } from 'src/history/history.service';
import { Message } from 'src/dto/state.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private historyService: HistoryService,
  ) {
    // Передаём server в HistoryService
    this.historyService.setSocketServer(this.server);
  }

  async handleConnection(client: Socket) {
    const token = this.extractTokenFromCookie(client);
    
    if (!token) {
      console.log('❌ No token, disconnecting');
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const email = payload.email;

      // Регистрируем пользователя
      this.historyService.registerUser(email, client);
      client.data.user = payload;

      console.log(`✅ Connected: ${email} (${client.id})`);

      // Отправляем историю при подключении
      const history = this.historyService.getUserHistory(email);
      client.emit('history', history);

    } catch (err) {
      console.log('❌ Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const email = client.data.user?.email;
    if (email) {
      this.historyService.unregisterUser(email);
      console.log(`Disconnected: ${email}`);
    }
  }

  // Вспомогательная функция
  private extractTokenFromCookie(client: Socket): string | null {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return null;

    const match = cookieHeader.match(/jwt=([^;]+)/);
    return match ? match[1] : null;
  }

  // Для отправки live-сообщения
  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() msg: any, @ConnectedSocket() client: Socket) {
    const email = client.data.user?.email;
    if (!email) return;

    const message: Message = {
      id: Date.now().toString(),
      ts: new Date().toISOString(),
      body: msg.body,
    };

    this.historyService.addLive(email, message);
  }
}