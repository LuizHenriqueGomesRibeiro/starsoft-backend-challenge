import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':seatId')
  async create(
    @Param('seatId') seatId: string,
    @Body('userId') userId: string,
  ) {
    return await this.reservationsService.reserveSeat(seatId, userId);
  }

  @Post(':id/confirm')
  async confirm(@Param('id') reservationId: string) {
    return await this.reservationsService.confirm(reservationId);
  }
}
