import { Module } from '@nestjs/common';
import { RecursoCursoService } from './recurso_curso.service';
import { RecursoCursoController } from './recurso_curso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursoCurso } from './entities/recurso_curso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecursoCurso])],
  controllers: [RecursoCursoController],
  providers: [RecursoCursoService],
})
export class RecursoCursoModule {}
