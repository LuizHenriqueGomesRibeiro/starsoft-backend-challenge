import { Injectable, Logger } from '@nestjs/common';
import { Seat, SeatStatus } from './entities/seat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeatsService {
  private readonly logger = new Logger(SeatsService.name);

  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async getSeatsBySession(sessionId: string): Promise<Seat[]> {
    this.logger.log({ msg: 'Buscando assentos para a sessão', sessionId });
    return this.seatRepository.find({
      where: { session: { id: sessionId } },
      order: { row: 'ASC', number: 'ASC' },
    });
  }

  async updateStatus(id: string, status: SeatStatus): Promise<void> {
    this.logger.log({
      msg: 'Atualizando status do assento',
      seatId: id,
      status,
    });
    await this.seatRepository.update(id, { status });
  }
}
