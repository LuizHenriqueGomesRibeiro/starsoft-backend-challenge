import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat, SeatStatus } from './entities/seat.entity';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async getSeatsBySession(sessionId: string): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { sessionId },
      order: { row: 'ASC', number: 'ASC' },
    });
  }

  async updateStatus(id: string, status: SeatStatus): Promise<void> {
    await this.seatRepository.update(id, { status });
  }
}
