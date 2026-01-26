import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seat } from '../../seats/entities/seat.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  movieTitle: string;

  @Column('timestamp')
  startTime: Date;

  @OneToMany(() => Seat, (seat) => seat.session, { cascade: true })
  seats: Seat[];
}
