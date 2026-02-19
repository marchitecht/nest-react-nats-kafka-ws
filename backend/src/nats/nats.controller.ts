import { Controller, Get } from '@nestjs/common';
import { NatsService } from './nats.service';

@Controller('nats')
export class NatsController {
  constructor(private readonly natsService: NatsService) {}

  @Get('state')
  getState() {
    return this.natsService.getState();
  }
}
