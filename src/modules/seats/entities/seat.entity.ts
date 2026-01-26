import { Session } from 'src/modules/session/entities/session.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

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
}
