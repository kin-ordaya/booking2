import { Module } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Eap } from 'src/eap/entities/eap.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Eap])],
  controllers: [CursoController],
  providers: [CursoService],
})
export class CursoModule {}
