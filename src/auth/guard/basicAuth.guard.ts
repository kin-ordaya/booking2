// Versión simplificada sin ConfigService
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private validUsername: string;
  private validPassword: string;

  constructor(private readonly config: ConfigService) {
    const username = this.config.get('POWERBI_USERNAME');
    const password = this.config.get('POWERBI_PASSWORD');

    if (!username || !password) {
      throw new Error(
        'POWERBI_USERNAME and POWERBI_PASSWORD must be set in environment variables',
      );
    }

    this.validUsername = username;
    this.validPassword = password;
  }

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
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [username, password] = credentials.split(':');

    if (username !== this.validUsername || password !== this.validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}