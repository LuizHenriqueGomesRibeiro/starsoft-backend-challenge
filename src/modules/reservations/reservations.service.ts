import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Reservation } from './entities/reservation.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Seat } from '../seats/entities/seat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Seat) private seatRepo: Repository<Seat>,
    @InjectRepository(Reservation) private resRepo: Repository<Reservation>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createPendingReservation(seatId: string, userId: string) {
    const seat = await this.seatRepo.findOne({
      where: { id: seatId, status: 'available' },
    });
    if (!seat) throw new BadRequestException('Assento indisponível');

    const lockKey = `lock:seat:${seatId}`;
    await this.cacheManager.set(lockKey, userId, 30000);

    seat.status = 'LOCKED';
    await this.seatRepo.save(seat);

    const reservation = this.resRepo.create({
      userId,
      seats: [seat],
      status: 'PENDING',
    });
    return this.resRepo.save(reservation);
  }

  async reserveSeat(seatId: string, userId: string) {
    const seat = await this.seatRepo.findOne({
      where: { id: seatId, status: 'available' },
    });

    if (!seat) {
      throw new BadRequestException('Assento não encontrado ou já ocupado.');
    }

    const lockKey = `lock:seat:${seatId}`;
    await this.cacheManager.set(lockKey, userId, 30000);

    seat.status = 'locked';
    await this.seatRepo.save(seat);

    const reservation = this.resRepo.create({
      userId,
      status: 'pending',
      seats: [seat],
    });

    return await this.resRepo.save(reservation);
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
