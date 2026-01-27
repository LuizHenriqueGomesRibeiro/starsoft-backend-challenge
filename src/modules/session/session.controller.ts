import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionService } from './session.service';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionService) {}

  @Post()
  async create(
    @Body('movieTitle') movieTitle: string,
    @Body('startTime') startTime: string,
  ) {
    const date = new Date(startTime);
    return await this.sessionsService.create(movieTitle, date);
  }

  @Get(':id/seats')
  async getSeats(@Param('id') sessionId: string) {
    return await this.sessionsService.findSeatsBySession(sessionId);
  }
}
