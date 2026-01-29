import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reservation } from './entities/reservation.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Seat } from '../seats/entities/seat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import type { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
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
      this.logger.log({
        msg: 'Iniciando transação para reserva pendente',
        seatId,
        userId,
      });
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
        this.logger.warn({
          msg: 'Assento indisponível ou em processo de compra por outro usuário',
          seatId,
          userId,
        });
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
      this.logger.log({
        msg: 'Reserva pendente criada com sucesso',
        reservationId: result.id,
        userId,
      });
      return {
        ...result,
        instanceId,
      };
    });
  }

  async confirm(reservationId: string) {
    return await this.dataSource.transaction(async (manager) => {
      this.logger.log({
        msg: 'Iniciando transação para confirmação de reserva',
        reservationId,
      });
      const reservation = await manager.findOne(Reservation, {
        where: { id: reservationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!reservation) {
        this.logger.warn({ msg: 'Reserva não encontrada', reservationId });
        throw new BadRequestException('Reserva não encontrada');
      }

      if (reservation.status === 'confirmed') {
        this.logger.warn({ msg: 'Reserva já confirmada', reservationId });
        throw new BadRequestException('Esta reserva já foi confirmada');
      }

      const seats = await manager.find(Seat, {
        where: { reservationId: reservation.id },
      });

      for (const seat of seats) {
        if (seat.status === 'occupied') {
          this.logger.warn({
            msg: 'Assento já ocupado',
            seatId: seat.id,
            reservationId,
          });
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

      this.logger.log({
        msg: 'Reserva confirmada com sucesso',
        reservationId: savedReservation.id,
      });
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
    this.logger.log({
      msg: 'Buscando histórico de reservas do usuário',
      userId,
    });
    return await this.resRepo.find({
      where: { userId, status: 'confirmed' },
      relations: ['seats'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
