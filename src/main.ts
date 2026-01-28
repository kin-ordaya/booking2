import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Booking 2 API')
    .setDescription('Booking 2 API description Despliegue')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://bookingravts.continental.edu.pe',
      'http://bookingravts.continental.edu.pe',
      'https://apibookingravts.continental.edu.pe',
      'https://bookinguc.netlify.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });

  ThrottlerModule.forRoot({
    throttlers: [
      {
        ttl: 1000,
        limit: 10,
      },
      {
        ttl: 60000,
        limit: 100,
      },
    ],
  });
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);

  // console.log(`Server started on port ${process.env.PORT}`);
}
bootstrap().catch((err) => {
  console.error(`Error during bootstrap`, err);
  process.exit(1);
});
