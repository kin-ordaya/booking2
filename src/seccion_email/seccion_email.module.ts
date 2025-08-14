import { Module } from '@nestjs/common';
import { SeccionEmailService } from './seccion_email.service';
import { SeccionEmailController } from './seccion_email.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeccionEmail } from './entities/seccion_email.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      SeccionEmail, Recurso
    ])
  ],
  controllers: [SeccionEmailController],
  providers: [SeccionEmailService],
})
export class SeccionEmailModule {}
