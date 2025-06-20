import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, RolUsuario])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
