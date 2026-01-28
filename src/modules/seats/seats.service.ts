import { Injectable } from '@nestjs/common';
import { Seat, SeatStatus } from './entities/seat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async getSeatsBySession(sessionId: string): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { session: { id: sessionId } },
      order: { row: 'ASC', number: 'ASC' },
    });
  }

  async updateStatus(id: string, status: SeatStatus): Promise<void> {
    await this.seatRepository.update(id, { status });
  }
}
