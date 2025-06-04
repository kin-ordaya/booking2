import { Module } from '@nestjs/common';
import { RecursoCursoService } from './recurso_curso.service';
import { RecursoCursoController } from './recurso_curso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursoCurso } from './entities/recurso_curso.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Curso } from 'src/curso/entities/curso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecursoCurso, Recurso, Curso])],
  controllers: [RecursoCursoController],
  providers: [RecursoCursoService],
})
export class RecursoCursoModule {}
