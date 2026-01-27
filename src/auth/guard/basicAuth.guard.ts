// Versión simplificada sin ConfigService
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  // Credenciales fijas desde variables de entorno
  private readonly validUsername = process.env.POWERBI_USERNAME || 'powerbi';
  private readonly validPassword = process.env.POWERBI_PASSWORD;

  canActivate(context: ExecutionContext): boolean {
    if (!this.validPassword) {
      throw new UnauthorizedException('Server misconfigured');
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Basic authentication required');
    }

    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (username !== this.validUsername || password !== this.validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}