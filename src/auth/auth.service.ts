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
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  private readonly apiKeyService;
  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
    private readonly configService: ConfigService,
  ) {
    this.apiKeyService = configService.get('API_KEY');
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
        where: { usuario: { id: user.id }, estado: 1 },
        relations: ['rol'],
      });
      if (!rolUsuario) {
        throw new NotFoundException(
          'Rol usuario no encontrado o rol usuario no activo',
        );
      }

      const jwtPayload = {
        sub: user.id,
        jti: randomUUID(),
        usuario_id: user.id,
        rol_usuario_id: rolUsuario.id,
        rol_nombre: rolUsuario.rol.nombre,
        iss: 'booking2backend',
        aud: 'booking2',
      };

      const token = await this.jwtService.signAsync(jwtPayload);

      // Actualizar el contexto del logger con el usuario autenticado
      this.logger.assign({
        userId: user.id,
        userRole: rolUsuario.rol.nombre,
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

  validateApiKey(apiKey: string) {
    return this.apiKeyService.includes(apiKey);
  }
}
