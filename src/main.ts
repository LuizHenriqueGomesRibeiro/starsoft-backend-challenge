import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllResponsesInterceptor } from './config/middlewares/instance-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new AllResponsesInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
