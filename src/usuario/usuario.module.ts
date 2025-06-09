import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { DocumentoIdentidad } from 'src/documento_identidad/entities/documento_identidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, DocumentoIdentidad])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
