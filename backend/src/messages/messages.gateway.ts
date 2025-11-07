import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HistoryService } from '../history/history.service';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private historyService: HistoryService) {}

  handleConnection(client: Socket) {
    try {
      const cookieHeader = client.handshake.headers.cookie;
      const jwtCookie = cookieHeader
        ?.split('; ')
        .find((c) => c.startsWith('jwt='))
        ?.split('=')[1];

      if (!jwtCookie) {
        client.disconnect();
        return;
      }

      // Проверяем JWT
      const payload: any = jwt.verify(
        jwtCookie,
        process.env.JWT_SECRET || 'qwer',
      );

      const email = payload.email;
      if (!email) {
        client.disconnect();
        return;
      }

      // Регистрируем сокет пользователя
      this.historyService.registerUser(email, client);

      console.log(`🔗 User connected via WS: ${email}`);
    } catch (err) {
      console.error('❌ WS connection failed:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Найти email по сокету
    for (const [email, socket] of this.historyService['userSockets'].entries()) {
      if (socket.id === client.id) {
        this.historyService.unregisterUser(email);
        break;
      }
    }
    console.log(`⚡ User disconnected: ${client.id}`);
  }
}
