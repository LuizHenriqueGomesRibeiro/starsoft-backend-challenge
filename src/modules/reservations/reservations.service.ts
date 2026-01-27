import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Reservation } from './entities/reservation.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Seat } from '../seats/entities/seat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import type { Cache } from 'cache-manager';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Seat) private seatRepo: Repository<Seat>,
    @InjectRepository(Reservation) private resRepo: Repository<Reservation>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
  ) {}

  async createPendingReservation(seatId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const seat = await manager.findOne(Seat, {
        where: { id: seatId, status: 'available' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!seat) {
        throw new BadRequestException('Assento indisponível ou já reservado');
      }

      const lockKey = `lock:seat:${seatId}`;
      await this.cacheManager.set(lockKey, userId, 30000);

      seat.status = 'locked';
      await manager.save(seat);

      const reservation = manager.create(Reservation, {
        userId,
        seats: [seat],
        status: 'pending',
      });

      return await manager.save(reservation);
    });
  }

  async confirm(reservationId: string) {
    const reservation = await this.resRepo.findOne({
      where: { id: reservationId },
      relations: ['seats'],
    });

    if (!reservation) throw new BadRequestException('Reserva não encontrada');

    reservation.status = 'confirmed';

    for (const seat of reservation.seats) {
      seat.status = 'occupied';
      await this.cacheManager.del(`lock:seat:${seat.id}`);
      await this.seatRepo.save(seat);
    }

    return await this.resRepo.save(reservation);
  }
}
