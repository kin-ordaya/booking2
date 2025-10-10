import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
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
      // origin: [
      //   'http://localhost:4200',
      //   'https://bookingravts.continental.edu.pe',
      //   'http://bookingravts.continental.edu.pe',
      // ],
      // credentials: true,
      // methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      // allowHeaders: ['Content-Type', 'Authorization'],
    });

    // Usar puerto 3001 en producción (configurado por T.I), 3000 en desarrollo
    const port = process.env.NODE_ENV === 'production' ? 3001 : (process.env.PORT || 3000);
    await app.listen(port, '0.0.0.0');

    console.log(`Servidor iniciado en puerto ${port}`);
    console.log(`Documentación disponible en http://localhost:${port}/docs`);
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}
bootstrap();
