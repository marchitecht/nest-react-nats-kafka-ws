import { Controller, Get } from '@nestjs/common';
import { NatsService } from './nats.service';
import type { StateDTO } from 'src/dto/state.dto';

@Controller('nats')
export class NatsController {
  constructor(private readonly natsService: NatsService) {}

   @Get('state')
  getState() {
    return this.natsService.getState();
  }
}