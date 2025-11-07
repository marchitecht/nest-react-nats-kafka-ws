import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { HistoryService } from '../history/history.service';
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
    private readonly jwtService: JwtService,
    private readonly historyService: HistoryService,
  ) {}

  // 🔹 подключение пользователя
  async handleConnection(client: Socket) {
    console.log('⚡ handleConnection triggered');

    const token = this.extractTokenFromCookie(client);

    if (!token) {
      console.log('❌ No token, disconnecting');
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const email = payload.email;

      // Сохраняем пользователя в данных сокета
      client.data.user = payload;

      // Регистрируем в HistoryService
      this.historyService.registerUser(email, client);

      console.log(`✅ Connected: ${email} (${client.id})`);

      // Отправляем историю сообщений при подключении
      const history = this.historyService.getUserHistory(email);
      client.emit('history', history);
    } catch (err) {
      console.log('❌ Invalid token in socket:', err.message);
      client.disconnect();
    }
  }

  // 🔹 отключение пользователя
  handleDisconnect(client: Socket) {
    const email = client.data.user?.email;
    if (email) {
      this.historyService.unregisterUser(email);
      console.log(`⚡ Disconnected: ${email}`);
    }
  }

  // 🔹 отправка live-сообщений
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

  // вспомогательная функция для извлечения JWT
  private extractTokenFromCookie(client: Socket): string | null {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return null;

    const match = cookieHeader.match(/jwt=([^;]+)/);
    return match ? match[1] : null;
  }
}
