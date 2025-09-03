import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Obtener el usuario (puede ser una Promise o un objeto)
    let user = request.user || request.usuario;

    // Si es una Promise, resolverla
    if (user instanceof Promise) {
      user = await user;
    }

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.includes(user.rol_nombre);

    if (!hasRole) {
      throw new ForbiddenException('No tiene los permisos requeridos');
    }
    //console.log('valido');

    return true;
  }
}
