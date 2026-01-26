import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Index } from 'typeorm';

export enum SeatStatus {
  AVAILABLE = 'available',
  LOCKED = 'locked',
  OCCUPIED = 'occupied',
}

@Entity('seats')
@Index(['sessionId', 'row', 'number'], { unique: true })
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  row: string;

  @Column()
  number: number;

  @Column({
    type: 'enum',
    enum: SeatStatus,
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;

  @Column()
  sessionId: string;
}
