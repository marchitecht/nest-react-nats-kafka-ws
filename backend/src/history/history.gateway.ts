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
import { HistoryService } from './history.service';
import { Message } from 'src/dto/state.dto';

@WebSocketGateway(3000, {
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class HistoryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly historyService: HistoryService) {}

  // Подключение клиента
  handleConnection(client: Socket) {
    const email = client.handshake.query.email as string;
    if (!email) {
      client.disconnect();
      return;
    }

    console.log(`⚡ Client connected: ${email}`);
    this.historyService.registerUser(email, client);
  }

  // Отключение клиента
  handleDisconnect(client: Socket) {
    const email = client.handshake.query.email as string;
    if (email) this.historyService.unregisterUser(email);
    console.log(`⚡ Client disconnected: ${email}`);
  }

  // Получение сообщений с фронта
  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() msg: any, @ConnectedSocket() client: Socket) {
    const email = client.handshake.query.email as string;
    if (!email) return;

    const message: Message = {
      id: Date.now().toString(),
      ts: new Date().toISOString(),
      body: msg.body,
    };

    this.historyService.addLive(email, message);
  }
}
