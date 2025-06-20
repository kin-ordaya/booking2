import { Module } from '@nestjs/common';
import { ClaseService } from './clase.service';
import { ClaseController } from './clase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clase, CursoModalidad])],
  controllers: [ClaseController],
  providers: [ClaseService],
})
export class ClaseModule {}
