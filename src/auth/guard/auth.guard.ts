import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectPinoLogger(AuthGuard.name) // Inyectar logger aquí también
    private readonly logger: PinoLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isLoginRoute =
      request.url.includes('/auth/login') && request.method === 'POST';
    // Establecer valores por defecto
    // (request as any).userId = 'anonymous';
    // (request as any).userRole = 'anonymous';
    if (isLoginRoute) {
      // Para login, solo establecer contexto anónimo sin validar token
      this.logger.assign({
        userId: 'anonymous',
        userRole: 'anonymous',
      });
      return true;
    }
    const token = this.extractToken(request);
    if (!token) {
      this.logger.assign({
        userId: 'anonymous',
        userRole: 'anonymous',
      });
      throw new UnauthorizedException(`No token present`);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request.usuario = payload;
      // (request as any).userId = payload.usuario_id;
      // (request as any).userRole = payload.rol_nombre;
      // Ahora puedes actualizar el contexto del logger
      this.logger.assign({
        userId: payload.usuario_id,
        userRole: payload.rol_nombre,
      });

      return true;
    } catch (error) {
      this.logger.assign({
        userId: 'anonymous',
        userRole: 'anonymous',
      });
      throw new UnauthorizedException(`Token no válido`);
    }
  }
  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
