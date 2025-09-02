import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector:Reflector) {}

  canActivate(context:ExecutionContext):boolean {

    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const usuario = request.usuario;
    console.log('Usuario: ', usuario);

    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.includes(usuario.rol.nombre);
    if (!hasRole) {
      throw new ForbiddenException('No tiene los permisos requeridos');
    }

    return true;
  }
}