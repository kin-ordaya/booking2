import { Module } from '@nestjs/common';
import { CursoModalidadService } from './curso_modalidad.service';
import { CursoModalidadController } from './curso_modalidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursoModalidad } from './entities/curso_modalidad.entity';
import { Curso } from 'src/curso/entities/curso.entity';
import { Modalidad } from 'src/modalidad/entities/modalidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CursoModalidad, Curso, Modalidad])],
  controllers: [CursoModalidadController],
  providers: [CursoModalidadService],
})
export class CursoModalidadModule {}
