import { Module } from '@nestjs/common';
import { RecursoService } from './recurso.service';
import { RecursoController } from './recurso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recurso } from './entities/recurso.entity';
import { TipoRecurso } from 'src/tipo_recurso/entities/tipo_recurso.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recurso, TipoRecurso, Proveedor])],
  controllers: [RecursoController],
  providers: [RecursoService],
})
export class RecursoModule {}
