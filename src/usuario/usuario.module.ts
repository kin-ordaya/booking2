import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { DocumentoIdentidad } from 'src/documento_identidad/entities/documento_identidad.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, DocumentoIdentidad, Rol, RolUsuario]),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
