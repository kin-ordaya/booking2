import { Module } from '@nestjs/common';
import { RolUsuarioService } from './rol_usuario.service';
import { RolUsuarioController } from './rol_usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolUsuario } from './entities/rol_usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RolUsuario])],
  controllers: [RolUsuarioController],
  providers: [RolUsuarioService],
})
export class RolUsuarioModule {}
