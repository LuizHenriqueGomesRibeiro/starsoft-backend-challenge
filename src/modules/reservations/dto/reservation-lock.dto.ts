import { IsUUID, IsNotEmpty } from 'class-validator';

export class ReservationLockDto {
  @IsUUID()
  @IsNotEmpty()
  seatId: string;
}
