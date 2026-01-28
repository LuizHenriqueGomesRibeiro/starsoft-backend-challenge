import {
  Controller,
  Param,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('lock/:id')
  async lockSeat(
    @Param('id') seatId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return await this.reservationsService.createPendingReservation(
      seatId,
      req.user.userId,
    );
  }

  @Post('confirm/:id')
  async confirm(@Param('id') reservationId: string) {
    return await this.reservationsService.confirm(reservationId);
  }

  @Get('my-history')
  async getMyHistory(@Request() req: AuthenticatedRequest) {
    return await this.reservationsService.getUserHistory(req.user.userId);
  }
}
