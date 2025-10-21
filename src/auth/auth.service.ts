import { LoginDto } from './dto/login.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { OAuth2Client } from 'google-auth-library';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
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
      this.logger.info(
        {
          operation: 'login_started',
          entity: 'auth',
        },
        'Iniciando proceso de login',
      );

      const googleUser = await this.verifyIdToken(idToken);
      if (!googleUser) {
        this.logger.error(
          {
            operation: 'login_failed',
            reason: 'invalid_google_token',
          },
          'Token de Google no válido',
        );

        throw new BadRequestException('Token de Google no válido');
      }
      const emailGoogle = googleUser.email;
      const user = await this.usuarioRepository.findOne({
        where: { correo_institucional: emailGoogle },
      });
      if (!user) {
        this.logger.error(
          {
            operation: 'login_failed',
            entity: 'auth',
            reason: 'user_not_found',
            email: googleUser.email || 'unknown',
          },
          'Usuario no encontrado',
        );

        throw new NotFoundException('Usuario no encontrado');
      }
      const rolUsuario = await this.rolUsuarioRepository.findOne({
        where: { usuario: { id: user.id }, estado: 1 },
        relations: ['rol'],
      });
      if (!rolUsuario) {
        this.logger.error(
          {
            operation: 'login_failed',
            entity: 'auth',
            reason: 'invalid_role',
            userId: user.id || 'unknown',
          },
          'Rol de usuario no activo',
        );

        throw new NotFoundException(
          'Rol usuario no encontrado o rol usuario no activo',
        );
      }
      const jwtPayload = {
        //correo_institucional: user.correo_institucional,
        //nombres: user.nombres,
        //apellidos: user.apellidos,
        //usuario_id: user.id,
        rol_usuario_id: rolUsuario.id,
        rol_nombre: rolUsuario.rol.nombre,
      };
      const token = await this.jwtService.signAsync(jwtPayload);
      this.logger.info(
        {
          operation: 'login_success',
          entity: 'auth',
          reason: 'login_success',
          userId: user.id || 'unknown',
          role: rolUsuario.rol.nombre || 'unknown',
        },
        'Login exitoso',
      );

      return { token };
    } catch (error) {
      this.logger.error(
        {
          operation: 'login_error',
          entity: 'auth',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de login',
      );
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
      //console.log(error);
      throw error;
    }
  }

  // private getCorrelationId(): string {
  //   // Implementa cómo obtener el correlationId del request actual
  //    return (this.request as any)[CORRELATION_ID_HEADER] || 'unknown';
  // }
}
