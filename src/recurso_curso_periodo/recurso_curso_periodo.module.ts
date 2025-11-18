import { Module } from '@nestjs/common';
import { RecursoCursoPeriodoService } from './recurso_curso_periodo.service';
import { RecursoCursoPeriodoController } from './recurso_curso_periodo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursoCursoPeriodo } from './entities/recurso_curso_periodo.entity';
import { RecursoCurso } from 'src/recurso_curso/entities/recurso_curso.entity';
import { Periodo } from 'src/periodo/entities/periodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecursoCursoPeriodo, RecursoCurso, Periodo])],
  controllers: [RecursoCursoPeriodoController],
  providers: [RecursoCursoPeriodoService],
})
export class RecursoCursoPeriodoModule {}
