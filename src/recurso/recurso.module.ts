import { Module } from '@nestjs/common';
import { RecursoService } from './recurso.service';
import { RecursoController } from './recurso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recurso } from './entities/recurso.entity';
import { TipoRecurso } from 'src/tipo_recurso/entities/tipo_recurso.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { TipoAcceso } from 'src/tipo_acceso/entities/tipo_acceso.entity';
import { Credencial } from 'src/credencial/entities/credencial.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recurso, TipoRecurso, TipoAcceso,Proveedor, RolUsuario])],
  controllers: [RecursoController],
  providers: [RecursoService],
})
export class RecursoModule {}
