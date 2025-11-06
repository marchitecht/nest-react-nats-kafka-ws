import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import type { Message } from 'src/dto/state.dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private socketServer: Server | null = null;

  // email → socket
  private userSockets = new Map<string, Socket>();

  // email → массив сообщений
  private userMessages = new Map<string, Message[]>();

  setSocketServer(server: Server) {
    this.socketServer = server;
  }

  /** Регистрируем сокет пользователя */
  registerUser(email: string, socket: Socket) {
    this.userSockets.set(email, socket);
    this.logger.log(`🔗 User connected: ${email}`);

    // Отправляем сразу накопленные сообщения
    const messages = this.getUserHistory(email);
    if (messages.length > 0) {
      socket.emit('history', messages);
    }
  }

  /** Удаляем сокет при дисконнекте */
  unregisterUser(email: string) {
    this.userSockets.delete(email);
    this.logger.log(`❌ User disconnected: ${email}`);
  }

  /** Добавляем live-сообщение конкретному пользователю */
  addLive(email: string, msg: Message) {
    const messages = this.userMessages.get(email) ?? [];
    messages.unshift(msg);
    this.userMessages.set(email, messages);

    this.logger.log(`📩 New live message for ${email}: ${JSON.stringify(msg)}`);

    const socket = this.userSockets.get(email);
    if (socket && socket.connected) {
      socket.emit('live', msg);
    }
  }

  /** Получить всю историю пользователя */
  getUserHistory(email: string): Message[] {
    return this.userMessages.get(email) ?? [];
  }

  /** Получить все сообщения всех пользователей (например, для админа) */
  getAll(): { [email: string]: Message[] } {
    const result: Record<string, Message[]> = {};
    for (const [email, messages] of this.userMessages.entries()) {
      result[email] = messages;
    }
    return result;
  }
}
