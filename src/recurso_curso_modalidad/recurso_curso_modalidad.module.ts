import { Module } from '@nestjs/common';
import { RecursoCursoModalidadService } from './recurso_curso_modalidad.service';
import { RecursoCursoModalidadController } from './recurso_curso_modalidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursoCursoModalidad } from './entities/recurso_curso_modalidad.entity';
import { CursoModalidad } from '@/curso_modalidad/entities/curso_modalidad.entity';
import { Recurso } from '@/recurso/entities/recurso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecursoCursoModalidad, CursoModalidad, Recurso]),
  ],
  controllers: [RecursoCursoModalidadController],
  providers: [RecursoCursoModalidadService],
})
export class RecursoCursoModalidadModule {}
