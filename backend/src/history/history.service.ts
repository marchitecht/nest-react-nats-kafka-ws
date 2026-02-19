import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Message } from 'src/dto/state.dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  // email → socket
  private sockets = new Map<string, Socket>();

  // email → массив сообщений
  private messages = new Map<string, Message[]>();

  /** Регистрируем пользователя */
  registerUser(email: string, socket: Socket) {
    this.sockets.set(email, socket);
    this.logger.log(`🔗 User connected: ${email}`);

    // сразу отправляем историю
    const history = this.getUserHistory(email);
    if (history.length) {
      socket.emit('history', history);
    }
  }

  /** Удаляем пользователя при дисконнекте */
  unregisterUser(email: string) {
    this.sockets.delete(email);
    this.logger.log(`❌ User disconnected: ${email}`);
  }

  /** Добавляем live-сообщение конкретному пользователю */
  addLive(email: string, msg: Message) {
    const arr = this.messages.get(email) ?? [];
    arr.unshift(msg);
    this.messages.set(email, arr);

    this.logger.log(`📩 New live message for ${email}: ${JSON.stringify(msg)}`);

    const socket = this.sockets.get(email);
    if (socket && socket.connected) {
      socket.emit('live', msg);
    }
  }

  /** Получить всю историю пользователя */
  getUserHistory(email: string): Message[] {
    return this.messages.get(email) ?? [];
  }

  /** Получить все сообщения всех пользователей */
  getAll(): Record<string, Message[]> {
    const result: Record<string, Message[]> = {};
    for (const [email, msgs] of this.messages.entries()) {
      result[email] = msgs;
    }
    return result;
  }
}
