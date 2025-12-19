import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import { ImportResultDto } from './dto/result-import.dto';
import * as XLSX from 'xlsx';
import { DocumentoIdentidadService } from 'src/documento_identidad/documento_identidad.service';
import { RolService } from 'src/rol/rol.service';
import { RolUsuarioService } from 'src/rol_usuario/rol_usuario.service';
import { CursoService } from 'src/curso/curso.service';
import { EapService } from 'src/eap/eap.service';
import { PlanService } from 'src/plan/plan.service';

@Injectable()
export class ImportService {
  private readonly COLUMNAS_TODAS = [
    'nombres',
    'apellidos',
    'numero_documento',
    'documento_identidad',
    'correo_institucional',
    'correo_personal',
    'telefono_institucional',
    'telefono_personal',
    'sexo',
    'direccion',
    'rol',
  ];

  private readonly COLUMNAS_OBLIGATORIAS = [
    'nombres',
    'apellidos',
    'numero_documento',
    'documento_identidad',
    'correo_institucional',
    'telefono_institucional',
    'sexo',
    'rol',
  ];

  private readonly COLUMNAS_OPCIONALES = [
    'correo_personal',
    'telefono_personal',
    'direccion',
  ];

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly documentoIdentidadService: DocumentoIdentidadService,
    private readonly rolService: RolService,
    private readonly rolUsuarioService: RolUsuarioService,
    private readonly cursoService: CursoService,
    private readonly eapService: EapService,
    private readonly planService: PlanService,
  ) {}

  async procesarExcel(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer);

    // Verificar si existe la hoja "usuario"
    if (!workbook.SheetNames.includes('usuario')) {
      throw new BadRequestException(
        `No se encontró la hoja 'usuario' en el archivo. \n` +
          `Hojas disponibles: ${workbook.SheetNames.join(', ')}`,
      );
    }

    const worksheet = workbook.Sheets['usuario'];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log();

    // Validar si hay datos
    if (!data || data.length === 0) {
      throw new BadRequestException('El archivo Excel está vacío');
    }

    // mostrar el nombre de la hoja
    console.log(workbook.SheetNames);

    // Validar que existan las columnas obligatorias en el encabezado
    this.validarColumnasObligatoriasEncabezado(data);

    // Validar que los datos estén completos según tipo de columna
    this.validarDatosCompletos(data);

    const resultados_usuarios: ImportResultDto = {
      exitosos: 0,
      errores: 0,
      detalles: [],
    };
    const resultados_roles_usuarios: ImportResultDto = {
      exitosos: 0,
      errores: 0,
      detalles: [],
    };
    const resultados_cursos: ImportResultDto = {
      exitosos: 0,
      errores: 0,
      detalles: [],
    };
    //Procesando usuarios
    console.log("Procesando usuarios");
    for (const [index, row] of data.entries()) {
      try {
        // Filtrar solo las columnas que necesitamos (ignorar extras)
        const filaFiltrada = this.filtrarColumnas(row);
        await this.procesarFilaUsuario(filaFiltrada);
        resultados_usuarios.exitosos++;
      } catch (error) {
        resultados_usuarios.errores++;
        resultados_usuarios.detalles.push({
          fila: index + 2, // +2 porque index empieza en 0 y la fila 1 son los encabezados
          error: error.message,
        });
      }
    }
    console.log("Procesando roles usuarios");
    //Procesando roles
    for (const [index, row] of data.entries()) {
      try {
        // Filtrar solo las columnas que necesitamos (ignorar extras)
        const filaFiltrada = this.filtrarColumnas(row);
        await this.procesarFilaRolUsuario(filaFiltrada);
        resultados_roles_usuarios.exitosos++;
      } catch (error) {
        resultados_roles_usuarios.errores++;
        resultados_roles_usuarios.detalles.push({
          fila: index + 2, // +2 porque index empieza en 0 y la fila 1 son los encabezados
          error: error.message,
        });
      }
    }

    //Procesando cursos
    console.log("Procesando cursos");
    for (const [index, row] of data.entries()) {
      try {
        // Filtrar solo las columnas que necesitamos (ignorar extras)
        const filaFiltrada = this.filtrarColumnas(row);
        await this.procesarFilaCurso(filaFiltrada);
        resultados_cursos.exitosos++;
      } catch (error) {
        resultados_cursos.errores++;
        resultados_cursos.detalles.push({
          fila: index + 2, // +2 porque index empieza en 0 y la fila 1 son los encabezados
          error: error.message,
        });
      }
    }

    return {
      usuarios: resultados_usuarios,
      roles_usuarios: resultados_roles_usuarios,
    };
  }

  /**
   * Valida que existan las columnas obligatorias en el ENCABEZADO
   * Todas las columnas (obligatorias y opcionales) deben estar en el encabezado
   * @param data Datos del Excel
   */
  private validarColumnasObligatoriasEncabezado(data: any[]): void {
    if (data.length === 0) return;

    const primeraFila = data[0];
    const columnasEncontradas = Object.keys(primeraFila);

    console.log('Columnas encontradas:', columnasEncontradas);

    // CORRECCIÓN: Solo verificar columnas OBLIGATORIAS
    const columnasFaltantes = this.COLUMNAS_OBLIGATORIAS.filter(
      (columna) => !columnasEncontradas.includes(columna),
    );

    if (columnasFaltantes.length > 0) {
      throw new BadRequestException(
        `Faltan columnas obligatorias en el encabezado: ${columnasFaltantes.join(', ')}\n` +
          `Columnas obligatorias requeridas: ${this.COLUMNAS_OBLIGATORIAS.join(', ')}\n` +
          `Columnas encontradas: ${columnasEncontradas.join(', ')}`,
      );
    }

    // Verificar columnas opcionales (solo para información)
    const columnasOpcionalesFaltantes = this.COLUMNAS_OPCIONALES.filter(
      (columna) => !columnasEncontradas.includes(columna),
    );

    if (columnasOpcionalesFaltantes.length > 0) {
      console.log(
        `ℹ️  Columnas opcionales no encontradas (se usarán valores por defecto): ${columnasOpcionalesFaltantes.join(', ')}`,
      );
    }

    // Opcional: Mostrar advertencia si hay columnas extras (pero no error)
    const columnasExtras = columnasEncontradas.filter(
      (columna) => !this.COLUMNAS_TODAS.includes(columna),
    );

    if (columnasExtras.length > 0) {
      console.log(
        `⚠️  Columnas extras detectadas (serán ignoradas): ${columnasExtras.join(', ')}`,
      );
    }
  }

  /**
   * Filtra solo las columnas que necesitamos de una fila
   * @param row Fila completa del Excel
   * @returns Fila con solo las columnas necesarias
   */
  private filtrarColumnas(row: any): any {
    const filaFiltrada = {};

    // Solo copiamos las columnas que nos interesan (todas)
    for (const columna of this.COLUMNAS_TODAS) {
      if (row[columna] !== undefined) {
        filaFiltrada[columna] = row[columna];
      }
    }

    return filaFiltrada;
  }

  /**
   * Valida que cada fila tenga valores según tipo de columna
   * Obligatorias: no pueden estar vacías
   * Opcionales: pueden estar vacías
   * @param data Datos del Excel
   */
  private validarDatosCompletos(data: any[]): void {
    for (const [index, row] of data.entries()) {
      const numeroFila = index + 2; // +2 por encabezados y base 0

      // Validar columnas obligatorias
      for (const columna of this.COLUMNAS_OBLIGATORIAS) {
        // Validar que no sea null, undefined o string vacío
        if (
          row[columna] === null ||
          row[columna] === undefined ||
          row[columna] === ''
        ) {
          throw new BadRequestException(
            `Fila ${numeroFila}: La columna obligatoria '${columna}' está vacía`,
          );
        }
      }

      // Validar formato de email si correo_institucional tiene valor
      if (row.correo_institucional) {
        this.validarEmail(
          row.correo_institucional,
          numeroFila,
          'correo_institucional',
        );
      }

      // Validar formato de email si correo_personal tiene valor (y no está vacío)
      if (row.correo_personal && row.correo_personal.trim() !== '') {
        this.validarEmail(row.correo_personal, numeroFila, 'correo_personal');
      }

      // Validar que sexo tenga valores válidos
      if (row.sexo) {
        this.validarSexo(row.sexo, numeroFila);
      }
    }
  }

  /**
   * Valida formato de email
   * @param email Email a validar
   * @param numeroFila Número de fila para mensaje de error
   * @param nombreCampo Nombre del campo para mensaje de error
   */
  private validarEmail(
    email: string,
    numeroFila: number,
    nombreCampo: string,
  ): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException(
        `Fila ${numeroFila}: El ${nombreCampo} '${email}' no tiene un formato válido`,
      );
    }
  }

  /**
   * Valida que el sexo tenga valores válidos
   * @param sexo Valor del campo sexo
   * @param numeroFila Número de fila para mensaje de error
   */
  private validarSexo(sexo: string, numeroFila: number): void {
    const sexosValidos = ['M', 'F', 'MASCULINO', 'FEMENINO', 'MASC', 'FEM'];
    const sexoNormalizado = sexo.toUpperCase().trim();

    if (!sexosValidos.includes(sexoNormalizado)) {
      throw new BadRequestException(
        `Fila ${numeroFila}: El sexo '${sexo}' no es válido. Valores aceptados: M, F, MASCULINO, FEMENINO`,
      );
    }
  }

  /**
   * Valida formato de teléfono (solo números, mínimo 7 dígitos)
   * @param telefono Teléfono a validar
   * @param numeroFila Número de fila para mensaje de error
   * @param nombreCampo Nombre del campo para mensaje de error
   */
  // private validarTelefono(
  //   telefono: string,
  //   numeroFila: number,
  //   nombreCampo: string,
  // ): void {
  //   // Si el teléfono está vacío y es opcional, no validar
  //   if (!telefono || telefono.trim() === '') {
  //     return;
  //   }

  //   const telefonoRegex = /^[0-9]{7,15}$/;
  //   const telefonoLimpio = telefono.toString().replace(/\D/g, '');

  //   if (!telefonoRegex.test(telefonoLimpio)) {
  //     throw new BadRequestException(
  //       `Fila ${numeroFila}: El ${nombreCampo} '${telefono}' no es válido. Debe contener solo números (7-15 dígitos)`,
  //     );
  //   }
  // }

  private async procesarFilaUsuario(row: any): Promise<any> {
    return await this.procesarUsuario(row);
  }

  private async procesarFilaRolUsuario(row: any): Promise<any> {
    return await this.procesarRolUsuario(row);
  }

  private async procesarFilaCurso(row: any): Promise<any> {
    return await this.procesarCurso(row);
  }

  private async procesarCurso(row: any): Promise<any> {
    // Validar que exista un plan con ese nombre
    console.log("Procesando curso");
    console.log(row.plan);
    const plan = await this.planService.findOneByNombre(row.plan);
    if (!plan)
      throw new NotFoundException(
        'No existe un plan con ese nombre: ' + row.plan,
      );
    // Crear curso
    const curso = await this.cursoService.create({
      ...row,
      plan_id: plan.id,
    });

    return curso;
  }

  //TODO: Agregar validaciones
  private async procesarRolUsuario(row: any): Promise<any> {
    // Normalizar documento_identidad
    if (row.documento_identidad) {
      const docUpper = row.documento_identidad.toUpperCase().trim();
      if (docUpper === 'DNI') {
        row.documento_identidad = 'DOCUMENTO NACIONAL DE IDENTIDAD';
      }
    }
    // Validar que exista un rol con ese nombre
    console.log("Procesando fila rol usuario");
    // console.log(row.rol);
    // console.log(typeof row.rol);
    const rol = await this.rolService.findOneByNombre(row.rol);
    if (!rol)
      throw new NotFoundException(
        'No existe un rol con ese nombre: ' + row.rol,
      );
    console.log(row.numero_documento);
    console.log(row.documento_identidad);
    // Crear rol usuario
    const usuario = await this.usuarioService.findOneByNumeroDocumento(
      row.numero_documento,
      row.documento_identidad,
    );

    if (!usuario)
      throw new NotFoundException(
        'No existe un usuario con ese numero de documento: ' +
          row.numero_documento,
      );

    return await this.rolUsuarioService.create({
      usuario_id: usuario.id,
      rol_id: rol.id,
    });
  }

  private async procesarUsuario(row: any): Promise<any> {
    // Normalizar documento_identidad
    if (row.documento_identidad) {
      const docUpper = row.documento_identidad.toUpperCase().trim();
      if (docUpper === 'DNI') {
        row.documento_identidad = 'DOCUMENTO NACIONAL DE IDENTIDAD';
      }
    }

    // Validar si usuario ya existe
    const usuarioExistente = await this.usuarioService.findOneByNumeroDocumento(
      row.numero_documento,
      row.documento_identidad,
    );

    if (usuarioExistente) {
      throw new ConflictException(
        `Usuario con documento ${row.numero_documento} ya existe`,
      );
    }

    // Obtener documento de identidad
    let documentoIdentidadNombre = row.documento_identidad;
    if (row.documento_identidad.toUpperCase().trim() === 'DNI') {
      documentoIdentidadNombre = 'DOCUMENTO NACIONAL DE IDENTIDAD';
    }

    const documentoExistente =
      await this.documentoIdentidadService.findOneByNombre(
        documentoIdentidadNombre,
      );

    if (!documentoExistente) {
      throw new Error(
        `No existe el documento de identidad: ${documentoIdentidadNombre}`,
      );
    }

    // Obtener rol
    const rolExistente = await this.rolService.findOneByNombre(row.rol);

    if (!rolExistente) {
      throw new Error(`No existe el rol: ${row.rol}`);
    }

    // Crear DTO para usuario
    const createUsuarioDto = new CreateUsuarioDto();
    createUsuarioDto.nombres = row.nombres;
    createUsuarioDto.apellidos = row.apellidos;
    createUsuarioDto.numero_documento = row.numero_documento;
    createUsuarioDto.correo_institucional = row.correo_institucional;
    createUsuarioDto.documento_identidad_id = documentoExistente.id;
    createUsuarioDto.rol_id = rolExistente.id;
    createUsuarioDto.telefono_institucional = row.telefono_institucional;
    createUsuarioDto.sexo = this.normalizarSexo(row.sexo);

    // Campos opcionales (solo asignar si tienen valor)
    if (row.correo_personal && row.correo_personal.trim() !== '') {
      createUsuarioDto.correo_personal = row.correo_personal;
    }

    if (row.telefono_personal && row.telefono_personal.trim() !== '') {
      createUsuarioDto.telefono_personal = row.telefono_personal;
    }

    if (row.direccion && row.direccion.trim() !== '') {
      createUsuarioDto.direccion = row.direccion;
    }

    return await this.usuarioService.create(createUsuarioDto);
  }

  /**
   * Normaliza el valor del sexo a formato estándar
   * @param sexo Valor del sexo
   * @returns Sexo normalizado (M o F)
   */
  private normalizarSexo(sexo: string): string {
    if (!sexo) return sexo;

    const sexoUpper = sexo.toUpperCase().trim();

    switch (sexoUpper) {
      case 'MASCULINO':
      case 'MASC':
      case 'M':
        return 'M';
      case 'FEMENINO':
      case 'FEM':
      case 'F':
        return 'F';
      default:
        return sexoUpper;
    }
  }
}
