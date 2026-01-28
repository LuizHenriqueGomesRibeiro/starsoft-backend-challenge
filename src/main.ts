import { AllResponsesInterceptor } from './config/middlewares/instance-id.interceptor';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new AllResponsesInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
