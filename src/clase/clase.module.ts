import { Module } from '@nestjs/common';
import { ClaseService } from './clase.service';
import { ClaseController } from './clase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { Aula } from 'src/aula/entities/aula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clase, Aula])],
  controllers: [ClaseController],
  providers: [ClaseService],
})
export class ClaseModule {}
