import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname,req,res',
            messageFormat: '{msg} [{context}]',
          },
        },
        quietReqLogger: true,
      },
    }),
  ],
})
export class CustomLoggerModule {}
