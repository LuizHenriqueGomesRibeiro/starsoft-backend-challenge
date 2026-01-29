import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Seat } from '../../seats/entities/seat.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.reservations, { nullable: false })
  user: User;

  @Column({ nullable: false })
  price: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @OneToMany(() => Seat, (seat) => seat.reservation)
  seats: Seat[];

  @CreateDateColumn()
  createdAt: Date;
}
