import { LoginDto } from './dto/login.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { OAuth2Client } from 'google-auth-library';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
  ) {
    this.client = new OAuth2Client(process.env.CLIENT_ID);
  }

  async login(loginDto: LoginDto) {
    try {
      const { idToken } = loginDto;
      const googleUser = await this.verifyIdToken(idToken);
      if (!googleUser) {
        throw new BadRequestException('Token de Google no válido');
      }
      const emailGoogle = googleUser.email;
      const user = await this.usuarioRepository.findOne({
        where: { correo_institucional: emailGoogle },
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const rolUsuario = await this.rolUsuarioRepository.findOne({
        where: { usuario: { id: user.id } },
      });
      if (!rolUsuario) {
        throw new NotFoundException('Rol usuario no encontrado');
      }
      const jwtPayload = {
        correo_institucional: user.correo_institucional,
        nombres: user.nombres,
        apellidos: user.apellidos,
        //usuario_id: user.id,
        rol_usuario_id: rolUsuario.id,
        // rol_id: rolUsuario.rol.id,
      };
      const token = this.jwtService.sign(jwtPayload);
      return { token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (payload) {
        return payload;
      } else {
        throw new BadRequestException('Token de Google no válido');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
