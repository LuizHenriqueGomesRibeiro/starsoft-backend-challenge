import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionService) {}

  @Post()
  async create(
    @Body('movieTitle') movieTitle: string,
    @Body('startTime') startTime: string,
    @Body('seats') seats: string[],
    @Body('price') price: number,
  ) {
    const date = new Date(startTime);
    return await this.sessionsService.create(movieTitle, date, seats, price);
  }

  @Get(':id/seats')
  async getSeats(@Param('id') sessionId: string) {
    return await this.sessionsService.findSeatsBySession(sessionId);
  }
}
