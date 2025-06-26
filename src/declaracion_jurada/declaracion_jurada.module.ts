import { Module } from '@nestjs/common';
import { DeclaracionJuradaService } from './declaracion_jurada.service';
import { DeclaracionJuradaController } from './declaracion_jurada.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeclaracionJurada } from './entities/declaracion_jurada.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeclaracionJurada, RolUsuario, Recurso, Responsable])],
  controllers: [DeclaracionJuradaController],
  providers: [DeclaracionJuradaService],
})
export class DeclaracionJuradaModule {}
