import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ResponseTransformInterceptor } from '@common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: true,
      forbidNonWhitelisted: true,
    }),
  );
  // app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.disable('x-powered-by');

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT', 3000));
}

bootstrap();
