import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Reservation } from './entities/reservation.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Seat } from '../seats/entities/seat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import type { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Seat) private seatRepo: Repository<Seat>,
    @InjectRepository(Reservation) private resRepo: Repository<Reservation>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
    @Inject('TICKET_SERVICE') private client: ClientProxy,
  ) {}

  async createPendingReservation(seatId: string, userId: string) {
    const instanceId = process.env.HOSTNAME;
    const lockKey = `lock:seat:${seatId}`;
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30000);

    return await this.dataSource.transaction(async (manager) => {
      const seat = await manager.findOne(Seat, {
        where: [
          { id: seatId, status: 'available' },
          {
            id: seatId,
            status: 'locked',
            lockedAt: LessThan(thirtySecondsAgo),
          },
        ],
        lock: { mode: 'pessimistic_write' },
      });

      if (!seat) {
        throw new BadRequestException({
          message:
            'Assento indisponível ou em processo de compra por outro usuário',
          instanceId,
        });
      }

      seat.status = 'locked';
      seat.lockedAt = now;
      await manager.save(seat);

      await this.cacheManager.set(lockKey, userId, 30000);

      let reservation = await manager.findOne(Reservation, {
        where: {
          seats: { id: seatId },
          status: 'pending',
        },
      });

      if (reservation) {
        reservation.userId = userId;
        reservation.createdAt = now;
      } else {
        reservation = manager.create(Reservation, {
          userId,
          seats: [seat],
          status: 'pending',
          price: seat.price,
        });
      }

      const result = await manager.save(reservation);

      return {
        ...result,
        instanceId,
      };
    });
  }

  async confirm(reservationId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const reservation = await manager.findOne(Reservation, {
        where: { id: reservationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!reservation) {
        throw new BadRequestException('Reserva não encontrada');
      }

      if (reservation.status === 'confirmed') {
        throw new BadRequestException('Esta reserva já foi confirmada');
      }

      const seats = await manager.find(Seat, {
        where: { reservationId: reservation.id },
      });

      for (const seat of seats) {
        if (seat.status === 'occupied') {
          throw new BadRequestException(
            `O assento ${seat.row}-${seat.number} já está ocupado`,
          );
        }

        seat.status = 'occupied';
        seat.lockedAt = null;
        await manager.save(seat);
        await this.cacheManager.del(`lock:seat:${seat.id}`);
      }

      reservation.status = 'confirmed';
      const savedReservation = await manager.save(reservation);

      this.client.emit('reservation_confirmed', {
        id: savedReservation.id,
        user: savedReservation.userId,
        seats: seats.map((s) => ({ row: s.row, num: s.number })),
        timestamp: new Date(),
      });

      return {
        ...savedReservation,
        seats,
      };
    });
  }

  async getUserHistory(userId: string) {
    return await this.resRepo.find({
      where: { userId, status: 'confirmed' },
      relations: ['seats'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
