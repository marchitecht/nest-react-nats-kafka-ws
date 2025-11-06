// src/messages/messages.module.ts
import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { HistoryService } from 'src/history/history.service';


@Module({
  providers: [MessagesGateway, HistoryService],
  exports: [HistoryService],
})
export class MessagesModule {}
