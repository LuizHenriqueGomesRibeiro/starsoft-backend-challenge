import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { Seat } from './entities/seat.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('session/:sessionId')
  async findBySession(@Param('sessionId') sessionId: string): Promise<Seat[]> {
    return this.seatsService.getSeatsBySession(sessionId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.seatsService.findOne(id);
  }
}
