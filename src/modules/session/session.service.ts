import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Repository } from 'typeorm';
import { Seat } from '../seats/entities/seat.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
  ) {}

  async create(movieTitle: string, startTime: Date) {
    const session = this.sessionRepository.create({
      movieTitle,
      startTime,
      seats: [],
    });

    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 10;

    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        const seat = new Seat();
        seat.row = row;
        seat.number = i;
        seat.status = 'available';
        session.seats.push(seat);
      }
    }

    return this.sessionRepository.save(session);
  }

  async findSeatsBySession(sessionId: string) {
    return await this.seatRepository.find({
      where: { session: { id: sessionId } },
      order: { row: 'ASC', number: 'ASC' },
    });
  }
}
