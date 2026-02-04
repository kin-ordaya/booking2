import { Module } from '@nestjs/common';
import { RecursoCursoModalidadPeriodoService } from './recurso_curso_modalidad_periodo.service';
import { RecursoCursoModalidadPeriodoController } from './recurso_curso_modalidad_periodo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursoCursoModalidadPeriodo } from './entities/recurso_curso_modalidad_periodo.entity';
import { RecursoCursoModalidad } from '@/recurso_curso_modalidad/entities/recurso_curso_modalidad.entity';
import { Periodo } from '@/periodo/entities/periodo.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      RecursoCursoModalidadPeriodo,
      RecursoCursoModalidad,
      Periodo
    ])
  ],
  controllers: [RecursoCursoModalidadPeriodoController],
  providers: [RecursoCursoModalidadPeriodoService],
})
export class RecursoCursoModalidadPeriodoModule {}
