import { Controller, Get, Param } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { Seat } from './entities/seat.entity';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('session/:sessionId')
  async findBySession(@Param('sessionId') sessionId: string): Promise<Seat[]> {
    return this.seatsService.getSeatsBySession(sessionId);
  }
}
