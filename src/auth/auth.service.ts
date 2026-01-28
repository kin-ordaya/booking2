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
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
    private readonly configService: ConfigService,
    private readonly config: ConfigService
  ) {
    this.apiKeyService = configService.get('API_KEY');
    if (!config.get('GOOGLE_CLIENT_ID') || !config.get('JWT_SECRET')) {
      throw new InternalServerErrorException(
        'Faltan datos de configuración para Google OAuth y JWT',
      );
    }
    this.client = new OAuth2Client(config.get('GOOGLE_CLIENT_ID'));
  }

  async login(loginDto: LoginDto) {
    const operation = 'login';
    const startTime = Date.now();
    try {
      const { idToken } = loginDto;

      this.logger.info(
        {
          operation,
          entity: 'auth',
          phase: 'start',
          reason: 'login_started',
          id_token: idToken,

        },
        'Iniciando proceso de login',
      );

      const googleUser = await this.verifyIdToken(idToken);
      if (!googleUser) {
        this.logger.warn(
          {
            operation,
            entity: 'auth',
            phase: 'validation_failed',
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
        this.logger.warn(
          {
            operation,
            entity: 'auth',
            phase: 'validation_failed',
            reason: 'user_not_found',
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
        this.logger.warn(
          {
            operation,
            entity: 'auth',
            phase: 'validation_failed',
            reason: 'user_not_active',
          },
          'Rol de usuario no activo',
        );

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

      const duration = Date.now() - startTime;

      this.logger.info(
        {
          operation,
          entity: 'auth',
          phase: 'success',
          reason: 'login_success',
          duration
        },
        'Login exitoso',
      );

      return { token };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          operation,
          entity: 'auth',
          phase: 'error',
          error_type: error.constructor.name,
          error_message: error.message,
          duration,
        },
        `Error en proceso de login: ${error.message}`,
      );
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
        audience: this.config.get('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (payload) {
        return payload;
      } else {
        throw new BadRequestException('Token de Google no válido');
      }
    } catch (error) {
      if(error instanceof BadRequestException) {
      throw error;}
      throw new InternalServerErrorException('Error al verificar token de Google');
    }
  }

  validateApiKey(apiKey: string) {
    return this.apiKeyService.includes(apiKey);
  }

  // private getCorrelationId(): string {
  //   // Implementa cómo obtener el correlationId del request actual
  //    return (this.request as any)[CORRELATION_ID_HEADER] || 'unknown';
  // }
}
function InjectConfig(): (target: typeof AuthService, propertyKey: undefined, parameterIndex: 5) => void {
  throw new Error('Function not implemented.');
}

