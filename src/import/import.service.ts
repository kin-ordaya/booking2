import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
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
import { CreateCursoDto } from 'src/curso/dto/create-curso.dto';
import { QueryImportDto } from './dto/query-import.dto';
import { CursoModalidadService } from 'src/curso_modalidad/curso_modalidad.service';
import { ModalidadService } from 'src/modalidad/modalidad.service';
import { ClaseService } from 'src/clase/clase.service';
import { PeriodoService } from 'src/periodo/periodo.service';
import { create } from 'domain';
import { CreateClaseDto } from 'src/clase/dto/create-clase.dto';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  // COLUMNAS ESPECÍFICAS POR TIPO
  private readonly COLUMNAS_USUARIOS_ROLES = {
    obligatorias: [
      'nombres',
      'apellidos',
      'numero_documento',
      'documento_identidad',
      'correo_institucional',
      'rol',
    ],
    opcionales: [
      'correo_personal',
      'telefono_institucional',
      'telefono_personal',
      'sexo',
      'direccion',
    ],
    todas: function () {
      return [...this.obligatorias, ...this.opcionales];
    },
  };

  private readonly COLUMNAS_CURSOS_MODALIDADES_CLASES = {
    obligatorias: ['codigo_curso', 'curso', 'plan', 'modalidad'],
    opcionales: ['codigo_cruzado', 'descripcion', 'eap'],
    todas: function () {
      return [...this.obligatorias, ...this.opcionales];
    },
  };

  // private readonly COLUMNAS_CLASES = {
  //   obligatorias: [
  //     'nrc',
  //     'inscritos',
  //     'tipo',
  //     'inicio',
  //     'fin',
  //     'codigo_curso',
  //     'modalidad',
  //     'periodo',
  //   ],
  //   opcionales: ['nrc_secundario', 'codigo_cruzado'],
  //   todas: function () {
  //     return [...this.obligatorias, ...this.opcionales];
  //   },
  // };

  constructor(
    private readonly claseService: ClaseService,
    private readonly cursoModalidadService: CursoModalidadService,
    private readonly cursoService: CursoService,
    private readonly documentoIdentidadService: DocumentoIdentidadService,
    private readonly eapService: EapService,
    private readonly modalidadService: ModalidadService,
    private readonly periodoService: PeriodoService,
    private readonly planService: PlanService,
    private readonly rolService: RolService,
    private readonly rolUsuarioService: RolUsuarioService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async procesarExcel(fileBuffer: Buffer, queryImportDto: QueryImportDto) {
    const { tipo } = queryImportDto;

    this.logger.log(`Iniciando importación de tipo: ${tipo}`);

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

    // Validar si hay datos
    if (!data || data.length === 0) {
      throw new BadRequestException('El archivo Excel está vacío');
    }

    // Obtener columnas según el tipo
    let columnasConfig;
    switch (tipo) {
      case 'usuarios':
        columnasConfig = this.COLUMNAS_USUARIOS_ROLES;
        break;
      case 'cursos':
        columnasConfig = this.COLUMNAS_CURSOS_MODALIDADES_CLASES;
        break;
      // case 'clases':
      //   columnasConfig = this.COLUMNAS_CLASES;
      //   break;
      default:
        throw new BadRequestException(`Tipo de importación no válido: ${tipo}`);
    }
    // Validar columnas obligatorias según tipo
    this.validarColumnasObligatorias(data, columnasConfig.obligatorias, tipo);

    // Filtrar solo las columnas relevantes
    const dataFiltrada = this.filtrarColumnasRelevantes(
      data,
      columnasConfig.todas(),
    );

    // Procesar según el tipo
    // if (tipo === 'usuarios') {
    //   return await this.procesarUsuarios(dataFiltrada);
    // } else {
    //   return await this.procesarCursos(dataFiltrada);
    // }

    switch (tipo) {
      case 'usuarios':
        return await this.procesarUsuarios(dataFiltrada);
      case 'cursos':
        return await this.procesarCursos(dataFiltrada);
      default:
        throw new BadRequestException(`Tipo de importación no válido: ${tipo}`);
    }
  }

  /**
   * Procesa usuarios y sus roles
   */
  private async procesarUsuarios(data: any[]): Promise<any> {
    this.logger.log(`Procesando ${data.length} filas para usuarios`);

    // Filtrar usuarios únicos
    const usuariosUnicos = this.filtrarUsuariosUnicos(data);
    this.logger.log(`Filtrados a ${usuariosUnicos.length} usuarios únicos`);

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

    // 1. Procesar usuarios
    for (const [index, row] of usuariosUnicos.entries()) {
      const numeroFila = index + 2;

      try {
        // Validar datos completos para usuario
        this.validarFilaUsuario(row, numeroFila);

        await this.procesarUsuario(row);
        resultados_usuarios.exitosos++;
      } catch (error) {
        resultados_usuarios.errores++;
        resultados_usuarios.detalles.push({
          fila: numeroFila,
          error: error.message,
        });
      }
    }

    // 2. Procesar roles para todas las filas (no solo únicos)
    for (const [index, row] of data.entries()) {
      const numeroFila = index + 2;

      try {
        // Solo procesar roles si tiene datos necesarios
        if (row.rol && row.numero_documento && row.documento_identidad) {
          await this.procesarRolUsuario(row);
          resultados_roles_usuarios.exitosos++;
        } else {
          this.logger.warn(
            `Fila ${numeroFila}: No tiene datos suficientes para asignar rol`,
          );
        }
      } catch (error) {
        resultados_roles_usuarios.errores++;
        resultados_roles_usuarios.detalles.push({
          fila: numeroFila,
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
   * Procesa cursos
   */
  private async procesarCursos(data: any[]): Promise<any> {
    this.logger.log(`Procesando ${data.length} filas para cursos`);

    // Filtrar cursos únicos
    const cursosUnicos = this.filtrarCursosUnicos(data);
    this.logger.log(`Filtrados a ${cursosUnicos.length} cursos únicos`);

    const resultados_cursos: ImportResultDto = {
      exitosos: 0,
      errores: 0,
      detalles: [],
    };

    const resultados_cursos_modalidad: ImportResultDto = {
      exitosos: 0,
      errores: 0,
      detalles: [],
    };

    const resultados_clases: ImportResultDto = {
      exitosos: 0,
      errores: 0,
      detalles: [],
    };

    // Procesar cursos
    for (const [index, row] of cursosUnicos.entries()) {
      const numeroFila = index + 2;

      try {
        // Validar que tenga datos mínimos de curso
        if (!row.codigo_curso || !row.curso || !row.eap || !row.plan) {
          throw new BadRequestException(
            `Fila ${numeroFila}: Faltan datos obligatorios para crear curso`,
          );
        }

        await this.procesarCurso(row);
        resultados_cursos.exitosos++;
      } catch (error) {
        resultados_cursos.errores++;
        resultados_cursos.detalles.push({
          fila: numeroFila,
          error: error.message,
        });
      }
    }

    for (const [index, row] of data.entries()) {
      const numeroFila = index + 2;

      try {
        // Validar que tenga datos mínimos de curso
        if (!row.codigo_curso || !row.modalidad) {
          throw new BadRequestException(
            `Fila ${numeroFila}: Faltan datos obligatorios para asignar curso a modalidad`,
          );
        }

        await this.procesarCursoModalidad(row);
        resultados_cursos_modalidad.exitosos++;
      } catch (error) {
        resultados_cursos_modalidad.errores++;
        resultados_cursos_modalidad.detalles.push({
          fila: numeroFila,
          error: error.message,
        });
      }
    }

    // Procesar clases
    for (const [index, row] of data.entries()) {
      const numeroFila = index + 2;

      try {
        console.log('Procesando fila: ' + numeroFila);
        console.log(row);
        // Validar que tenga datos mínimos de curso
        if (
          !row.nrc ||
          !row.inscritos ||
          !row.tipo ||
          !row.inicio ||
          !row.fin ||
          !row.codigo_curso ||
          !row.modalidad ||
          !row.periodo
        ) {
          throw new BadRequestException(
            `Fila ${numeroFila}: Faltan datos obligatorios para crear clase`,
          );
        }

        await this.procesarClase(row);
        resultados_clases.exitosos++;
      } catch (error) {
        resultados_clases.errores++;
        resultados_clases.detalles.push({
          fila: numeroFila,
          error: error.message,
        });
      }
    }
    return {
      cursos: resultados_cursos,
      cursos_modalidad: resultados_cursos_modalidad,
      clases: resultados_clases,
    };
  }

  /**
   * Valida columnas obligatorias según tipo
   */
  private validarColumnasObligatorias(
    data: any[],
    columnasObligatorias: string[],
    tipo: string,
  ): void {
    if (data.length === 0) return;

    const primeraFila = data[0];
    const columnasEncontradas = Object.keys(primeraFila);

    const columnasFaltantes = columnasObligatorias.filter(
      (columna) => !columnasEncontradas.includes(columna),
    );

    if (columnasFaltantes.length > 0) {
      throw new BadRequestException(
        `Para importar ${tipo}, faltan columnas obligatorias: ${columnasFaltantes.join(', ')}\n` +
          `Columnas obligatorias requeridas: ${columnasObligatorias.join(', ')}\n` +
          `Columnas encontradas: ${columnasEncontradas.join(', ')}`,
      );
    }

    // Mostrar advertencia de columnas extras (pero no error)
    const columnasRelevantes =
      tipo === 'usuarios'
        ? this.COLUMNAS_USUARIOS_ROLES.todas()
        : this.COLUMNAS_CURSOS_MODALIDADES_CLASES.todas();

    const columnasExtras = columnasEncontradas.filter(
      (columna) => !columnasRelevantes.includes(columna),
    );

    if (columnasExtras.length > 0) {
      this.logger.warn(
        `Columnas extras detectadas (serán ignoradas): ${columnasExtras.join(', ')}`,
      );
    }
  }

  /**
   * Filtra solo las columnas relevantes según tipo
   */
  private filtrarColumnasRelevantes(
    data: any[],
    columnasRelevantes: string[],
  ): any[] {
    return data.map((row) => {
      const filaFiltrada = {};

      // Solo copiamos las columnas relevantes
      for (const columna of columnasRelevantes) {
        if (row[columna] !== undefined) {
          filaFiltrada[columna] = row[columna];
        }
      }

      return filaFiltrada;
    });
  }

  private filtrarUsuariosUnicos(data: any[]): any[] {
    const visto = new Set<string>();
    const usuariosUnicos: any[] = []; // <-- Especificar tipo aquí

    for (const row of data) {
      if (row.numero_documento && row.documento_identidad) {
        const clave = `${row.numero_documento}_${this.normalizarDocumentoIdentidad(row.documento_identidad)}`;

        if (!visto.has(clave)) {
          visto.add(clave);
          usuariosUnicos.push(row);
        }
      }
    }

    return usuariosUnicos;
  }

  private filtrarCursosUnicos(data: any[]): any[] {
    const visto = new Set<string>();
    const cursosUnicos: any[] = []; // <-- Especificar tipo aquí

    for (const row of data) {
      if (row.codigo_curso) {
        const clave = row.codigo_curso.toString().trim();

        if (clave && !visto.has(clave)) {
          visto.add(clave);
          cursosUnicos.push(row);
        }
      }
    }

    return cursosUnicos;
  }
  /**
   * Valida una fila específica para usuario
   */
  private validarFilaUsuario(row: any, numeroFila: number): void {
    // Validar columnas obligatorias
    for (const columna of this.COLUMNAS_USUARIOS_ROLES.obligatorias) {
      if (!row[columna] || row[columna].toString().trim() === '') {
        throw new BadRequestException(
          `Fila ${numeroFila}: La columna obligatoria '${columna}' está vacía`,
        );
      }
    }

    // Validar formato de email
    if (row.correo_institucional) {
      this.validarEmail(
        row.correo_institucional,
        numeroFila,
        'correo_institucional',
      );
    }

    if (row.correo_personal && row.correo_personal.trim() !== '') {
      this.validarEmail(row.correo_personal, numeroFila, 'correo_personal');
    }

    // Validar sexo
    if (row.sexo) {
      this.validarSexo(row.sexo, numeroFila);
    }
  }

  /**
   * Métodos de validación (manteniendo tu lógica original)
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
   * Métodos de procesamiento (manteniendo tu lógica original)
   */
  private async procesarUsuario(row: any): Promise<any> {
    // Normalizar documento_identidad
    const documentoNormalizado = this.normalizarDocumentoIdentidad(
      row.documento_identidad,
    );

    // Validar si usuario ya existe
    const usuarioExistente = await this.usuarioService.findOneByNumeroDocumento(
      row.numero_documento,
      documentoNormalizado,
    );

    if (usuarioExistente) {
      throw new ConflictException(
        `Usuario con documento ${row.numero_documento} ya existe`,
      );
    }

    // Obtener documento de identidad
    const documentoExistente =
      await this.documentoIdentidadService.findOneByNombre(
        documentoNormalizado,
      );

    if (!documentoExistente) {
      throw new NotFoundException(
        `No existe el documento de identidad: ${documentoNormalizado}`,
      );
    }

    // Obtener rol
    const rolExistente = await this.rolService.findOneByNombre(row.rol);

    if (!rolExistente) {
      throw new NotFoundException(`No existe el rol: ${row.rol}`);
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

    // Campos opcionales
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

  private async procesarRolUsuario(row: any): Promise<any> {
    const documentoNormalizado = this.normalizarDocumentoIdentidad(
      row.documento_identidad,
    );

    // Validar que exista un rol con ese nombre
    const rol = await this.rolService.findOneByNombre(row.rol);
    if (!rol) {
      throw new NotFoundException(
        'No existe un rol con ese nombre: ' + row.rol,
      );
    }

    // Buscar usuario
    const usuario = await this.usuarioService.findOneByNumeroDocumento(
      row.numero_documento,
      documentoNormalizado,
    );

    if (!usuario) {
      throw new NotFoundException(
        'No existe un usuario con ese numero de documento: ' +
          row.numero_documento,
      );
    }

    // Crear rol usuario
    return await this.rolUsuarioService.create({
      usuario_id: usuario.id,
      rol_id: rol.id,
    });
  }

  private async procesarCurso(row: any): Promise<any> {
    // Validar que exista un plan con ese nombre
    const plan = await this.planService.findOneByNombre(row.plan);
    if (!plan) {
      throw new NotFoundException(
        'No existe un plan con ese nombre: ' + row.plan,
      );
    }

    const eap = await this.eapService.findOneByNombre(row.eap);
    if (!eap) {
      throw new NotFoundException(
        'No existe un EAP con ese nombre: ' + row.eap,
      );
    }

    // Crear DTO para curso
    const createCursoDto = new CreateCursoDto();
    createCursoDto.codigo = row.codigo_curso;
    createCursoDto.codigo_cruzado = row.codigo_cruzado || null;
    createCursoDto.nombre = row.curso;
    createCursoDto.descripcion = row.descripcion || '';
    createCursoDto.eap_id = eap.id;
    createCursoDto.plan_id = plan.id;

    // Crear curso
    return await this.cursoService.create(createCursoDto);
  }

  private async procesarCursoModalidad(row: any): Promise<any> {
    const modalidad = await this.modalidadService.findOneByNombre(
      row.modalidad,
    );
    if (!modalidad) throw new NotFoundException('Modalidad no encontrada');

    const curso = await this.cursoService.findOneByCodigo(row.codigo_curso);
    if (!curso) throw new NotFoundException('Curso no encontrado');

    return await this.cursoModalidadService.create({
      curso_id: curso.id,
      modalidad_id: modalidad.id,
    });
  }

  private async procesarClase(row: any): Promise<any> {
    const modalidad = await this.modalidadService.findOneByNombre(
      row.modalidad,
    );
    if (!modalidad) throw new NotFoundException('Modalidad no encontrada');

    const curso = await this.cursoService.findOneByCodigo(row.codigo_curso);
    if (!curso) throw new NotFoundException('Curso no encontrado');

    const periodo = await this.periodoService.findOneByNombre(row.periodo);
    if (!periodo) throw new NotFoundException('Periodo no encontrado');

    const cursoModalidad =
      await this.cursoModalidadService.findOneByIDCursoAndModalidad(
        curso.id,
        modalidad.id,
      );

    if (!cursoModalidad)
      throw new NotFoundException('CursoModalidad no encontrado');

    const createClaseDto = new CreateClaseDto();
    createClaseDto.curso_modalidad_id = cursoModalidad.id;
    createClaseDto.periodo_id = periodo.id;
    createClaseDto.inscritos = row.inscritos;
    createClaseDto.tipo = row.tipo;
    createClaseDto.codigo_cruzado = row.codigo_cruzado;
    createClaseDto.inicio = row.inicio;
    createClaseDto.fin = row.fin;

    return await this.claseService.create(createClaseDto);
  }

  /**
   * Métodos auxiliares de normalización
   */
  private normalizarDocumentoIdentidad(documento: string): string {
    if (!documento) return documento;

    const docUpper = documento.toUpperCase().trim();
    return docUpper === 'DNI' ? 'DOCUMENTO NACIONAL DE IDENTIDAD' : docUpper;
  }

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
