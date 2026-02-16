import { LoginDto } from './dto/login.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';

import { OAuth2Client } from 'google-auth-library';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly jwtService: JwtService,
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
    private readonly configService: ConfigService,
  ) {
    if (
      !configService.get('GOOGLE_CLIENT_ID') ||
      !configService.get('JWT_SECRET')
    ) {
      throw new InternalServerErrorException(
        'Faltan datos de configuración para Google OAuth y JWT',
      );
    }
    this.client = new OAuth2Client(configService.get('GOOGLE_CLIENT_ID'));
  }

  async login(loginDto: LoginDto) {
    try {
      const { idToken } = loginDto;

      const googleUser = await this.verifyIdToken(idToken);

      const userWithRol = await this.rolUsuarioRepository
        .createQueryBuilder('rolUsuario')
        .leftJoin('rolUsuario.usuario', 'usuario')
        .leftJoin('rolUsuario.rol', 'rol')
        .select([
          'rolUsuario.id',
          'usuario.id',
          'usuario.correo_institucional',
          'rol.nombre',
        ])
        .where('usuario.correo_institucional = :email', {
          email: googleUser.email,
        })
        .andWhere('rolUsuario.estado = :estado', { estado: 1 })
        .getOne();

      if (!userWithRol) {
        throw new NotFoundException('Usuario no encontrado o sin rol activo');
      }

      const jwtPayload = {
        sub: userWithRol.usuario.id,
        jti: randomUUID(),
        usuario_id: userWithRol.usuario.id,
        rol_usuario_id: userWithRol.id,
        rol_nombre: userWithRol.rol.nombre,
        iss: 'booking2backend',
        aud: 'booking2',
      };

      const token = await this.jwtService.signAsync(jwtPayload);

      // Actualizar el contexto del logger con el usuario autenticado
      this.logger.assign({
        userId: userWithRol.usuario.id,
        userRole: userWithRol.rol.nombre,
      });

      return { token };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al realizar login');
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (payload) {
        return payload;
      } else {
        throw new BadRequestException('Token de Google no válido');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al verificar token de Google',
      );
    }
  }
}
