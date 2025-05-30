import { Injectable } from '@nestjs/common';
import { CreateRolUsuarioDto } from './dto/create-rol_usuario.dto';
import { UpdateRolUsuarioDto } from './dto/update-rol_usuario.dto';

@Injectable()
export class RolUsuarioService {
  create(createRolUsuarioDto: CreateRolUsuarioDto) {
    return 'This action adds a new rolUsuario';
  }

  findAll() {
    return `This action returns all rolUsuario`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rolUsuario`;
  }

  update(id: number, updateRolUsuarioDto: UpdateRolUsuarioDto) {
    return `This action updates a #${id} rolUsuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} rolUsuario`;
  }
}
