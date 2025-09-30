import { ConflictException, Injectable } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import { ImportResultDto } from './dto/result-import.dto';
import * as xlsx from 'xlsx-community';
import { DocumentoIdentidadService } from 'src/documento_identidad/documento_identidad.service';
import { RolService } from 'src/rol/rol.service';

@Injectable()
export class ImportService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly documentoIdentidadService: DocumentoIdentidadService,
    private readonly rolService: RolService,
  ) {}

  async procesarExcel(fileBuffer: Buffer) {
    const workbook = xlsx.read(fileBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const resultados: ImportResultDto = {
      exitosos: 0,
      errores: 0,
      detalles: [],
    };

    for (const [index, row] of data.entries()) {
      try {
        await this.procesarFila(row);
        resultados.exitosos++;
      } catch (error) {
        resultados.errores++;
        resultados.detalles.push({
          fila: index + 2,
          error: error.message,
        });
      }
    }

    return resultados;
  }

  // ACTUALIZAR LA FIRMA PARA ACEPTAR 4 ARGUMENTOS
  private async procesarFila(row: any): Promise<any> {
    return await this.procesarUsuario(row);
  }

  // ACTUALIZAR procesarUsuario TAMBIÉN
  private async procesarUsuario(row: any): Promise<any> {
    // 1. Verificar si el usuario ya existe

    if(row.usuario_documento_identidad.toUpperCase() === 'DNI'){
      row.usuario_documento_identidad = 'DOCUMENTO NACIONAL DE IDENTIDAD';
    }
    const usuarioExistente = await this.usuarioService.findOneByNumeroDocumento(
      row.usuario_numero_documento, row.usuario_documento_identidad
    );

    if (usuarioExistente) {
      throw new ConflictException(
        `Usuario con documento ${row.usuario_numero_documento} ya existe`,
      );
    }

    // 2. Buscar documento y rol (usando el mapa si está disponible, o consulta individual)
    let documentoIdentidadNombre = row.usuario_documento_identidad;
    if (row.usuario_documento_identidad.toUpperCase() === 'DNI') {
      documentoIdentidadNombre = 'DOCUMENTO NACIONAL DE IDENTIDAD';
    }

    const documentoExistente =
      await this.documentoIdentidadService.findOneByNombre(
        documentoIdentidadNombre,
      );
    const rolExistente = await this.rolService.findOneByNombre(row.usuario_rol);

    if (!documentoExistente) {
      throw new Error(
        `No existe el documento de identidad: ${documentoIdentidadNombre}`,
      );
    }

    if (!rolExistente) {
      throw new Error(`No existe el rol: ${row.usuario_rol}`);
    }

    // 3. Crear DTO y delegar al servicio existente
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
    createUsuarioDto.documento_identidad_id = documentoExistente.id;
    createUsuarioDto.rol_id = rolExistente.id;

    // 4. Delegar al servicio existente
    return await this.usuarioService.create(createUsuarioDto);
  }
}
