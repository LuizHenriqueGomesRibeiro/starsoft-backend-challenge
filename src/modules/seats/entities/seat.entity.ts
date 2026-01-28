import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Session } from 'src/modules/session/entities/session.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

export enum SeatStatus {
  AVAILABLE = 'available',
  LOCKED = 'locked',
  OCCUPIED = 'occupied',
}

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  row: string;

  @Column()
  number: number;

  @Column({ default: 'available' })
  status: string;

  @ManyToOne(() => Session, (session) => session.seats)
  session: Session;

  @Column({ nullable: true })
  bookingId: string;

  @Column({ type: 'timestamp', nullable: true })
  lockedAt: Date | null;

  @Column({ nullable: true })
  reservationId: string;

  @ManyToOne(() => Reservation, (reservation) => reservation.seats, {
    nullable: true,
  })
  reservation: Reservation;
}
