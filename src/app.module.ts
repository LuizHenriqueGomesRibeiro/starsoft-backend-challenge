import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeatsModule } from './modules/seats/seats.module';
import { Seat } from './modules/seats/entities/seat.entity';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { SessionModule } from './modules/session/session.module';
import { Session } from './modules/session/entities/session.entity';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore.redisStore({
          socket: {
            host: 'redis',
            port: configService.get<number>('REDIS_PORT'),
          },
        }),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Seat, Session],
        synchronize: true,
        logging: true,
      }),
    }),
    SeatsModule,
    ReservationsModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL'),
      }),
    }),
    SessionModule,
  ],
})
export class AppModule {}
