import { Injectable } from '@nestjs/common';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';

@Injectable()
export class ImportService {
  constructor(private readonly usuarioService: UsuarioService) {}
  create(createImportDto: CreateImportDto) {
    return 'This action adds a new import';
  }

  private async procesarUsuario(row: any): Promise<Usuario> {
    const usuarioExistente = this.usuarioService.findOne(row.id);

    const documentoExistente = this.usuarioService.findOne(
      row.usuario_documento_identidad,
    );

    const rolExistente = this.usuarioService.findOne(row.usuario_rol_id);

    if (usuarioExistente) {
      return usuarioExistente;
    }

    if (!documentoExistente) {
      return Promise.reject('No existe el documento de identidad');
    }

    if (!rolExistente) {
      return Promise.reject('No existe el rol');
    }

    const createUsuarioDto = new CreateUsuarioDto();
    createUsuarioDto.nombres = row.usuario_nombres;
    createUsuarioDto.apellidos = row.usuario_apellidos;
    createUsuarioDto.numero_documento = row.usuario_numero_documento;
    createUsuarioDto.correo_institucional = row.usuario_correo_institucional;
    createUsuarioDto.correo_personal = row.usuario_correo_personal;
    createUsuarioDto.telefono_institucional =
      row.usuario_telefono_institucional;
    createUsuarioDto.telefono_personal = row.usuario_telefono_personal;
    createUsuarioDto.sexo = row.usuario_sexo;
    createUsuarioDto.direccion = row.usuario_direccion;
    createUsuarioDto.documento_identidad_id = row.usuario_documento_identidad;
    createUsuarioDto.rol_id = row.usuario_rol_id;

    return await this.usuarioService.create(row);
  }
  findAll() {
    return `This action returns all import`;
  }

  findOne(id: number) {
    return `This action returns a #${id} import`;
  }

  update(id: number, updateImportDto: UpdateImportDto) {
    return `This action updates a #${id} import`;
  }

  remove(id: number) {
    return `This action removes a #${id} import`;
  }
}
