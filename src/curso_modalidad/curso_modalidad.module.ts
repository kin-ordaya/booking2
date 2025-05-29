import { Module } from '@nestjs/common';
import { CursoModalidadService } from './curso_modalidad.service';
import { CursoModalidadController } from './curso_modalidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursoModalidad } from './entities/curso_modalidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CursoModalidad])],
  controllers: [CursoModalidadController],
  providers: [CursoModalidadService],
})
export class CursoModalidadModule {}
