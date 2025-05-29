import { Module } from '@nestjs/common';
import { TipoRecursoService } from './tipo_recurso.service';
import { TipoRecursoController } from './tipo_recurso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoRecurso } from './entities/tipo_recurso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoRecurso])],
  controllers: [TipoRecursoController],
  providers: [TipoRecursoService],
})
export class TipoRecursoModule {}
