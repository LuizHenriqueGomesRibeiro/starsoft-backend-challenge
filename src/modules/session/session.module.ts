import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionsController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Seat } from '../seats/entities/seat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Seat])],
  controllers: [SessionsController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
