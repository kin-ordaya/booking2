import { Module } from '@nestjs/common';
import { RolUsuarioService } from './rol_usuario.service';
import { RolUsuarioController } from './rol_usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolUsuario } from './entities/rol_usuario.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RolUsuario, Usuario, Rol])],
  controllers: [RolUsuarioController],
  providers: [RolUsuarioService],
})
export class RolUsuarioModule {}
