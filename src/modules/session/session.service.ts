import { BadRequestException, Injectable } from '@nestjs/common';
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

  async create(
    movieTitle: string,
    startTime: Date,
    seatList: string[],
    price: number,
  ) {
    const uniqueSeats = [...new Set(seatList.map((s) => s.toUpperCase()))];

    if (uniqueSeats.length < 16) {
      throw new BadRequestException(
        `A sessão precisa de 16 assentos únicos. Fornecidos: ${uniqueSeats.length}`,
      );
    }

    if (!seatList || seatList.length < 16) {
      throw new BadRequestException(
        'A sessão precisa ter no mínimo 16 assentos.',
      );
    }

    const session = this.sessionRepository.create({
      movieTitle,
      startTime,
      seats: [],
    });

    for (const seatCode of seatList) {
      const seat = new Seat();

      const rowMatch = seatCode.match(/[A-Z]+/i) || ['?'];
      const numMatch = seatCode.match(/\d+/) || ['0'];

      seat.row = rowMatch[0].toUpperCase();
      seat.number = parseInt(numMatch[0], 10);
      seat.status = 'available';
      seat.price = price;

      session.seats.push(seat);
    }

    return await this.sessionRepository.save(session);
  }

  async findSeatsBySession(sessionId: string) {
    return await this.seatRepository.find({
      where: { session: { id: sessionId } },
      order: { row: 'ASC', number: 'ASC' },
    });
  }
}
