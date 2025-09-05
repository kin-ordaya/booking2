import { CreateReservaGeneralDto } from './dto/create-reserva-general.dto';
import { PaginationReservaDto } from './dto/pagination-reserva.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservaMantenimientoGeneralDto } from './dto/create-reserva-mantenimiento-general.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Repository, DataSource, Brackets } from 'typeorm';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Credencial } from 'src/credencial/entities/credencial.entity';
import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';
import { CredencialesDisponiblesDto } from './dto/credenciales-disponibles-reserva.dto';
import { PaginationReservaInRangeDto } from './dto/pagination-reserva-in-range.dto';
import { CreateReservaMixtoDto } from './dto/create-reserva-mixto.dto';
import { CreateReservaMantenimientoMixtoDto } from './dto/create-reserva-mantenimiento-mixto.dto';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,

    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,

    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,

    private readonly dataSource: DataSource,
  ) {}

  // Métodos comunes
  private async validateBasicReservationData(
    recursoId: string,
    autorId: string,
    inicio: Date,
    fin: Date,
  ) {
    const [recurso, autor] = await Promise.all([
      this.recursoRepository.findOneBy({ id: recursoId }),
      this.rolUsuarioRepository.findOne({
        where: { id: autorId },
        relations: ['usuario', 'rol'],
      }),
    ]);

    if (!recurso) throw new NotFoundException('Recurso no encontrado');
    if (!autor) throw new NotFoundException('Autor no encontrado');

    await this.validarInicioyFinReserva(
      inicio,
      fin,
      autor.rol.nombre,
      recurso.tiempo_reserva,
    );
    this.validateReservationDuration(autor.rol.nombre, inicio, fin);

    return { recurso, autor };
  }

  private async validarInicioyFinReserva(
    inicio: Date,
    fin: Date,
    autorRol: string,
    recursoTiempoReserva: number,
  ) {
    // Normalizar todas las fechas a UTC para consistencia entre entornos
    const ahoraUTC = new Date();
    const inicioUTC = new Date(inicio);
    const finUTC = new Date(fin);

    // Para debugging - mostrar fechas en formato ISO (UTC)
    console.log(
      '[validarInicioyFinReserva] Inicio (UTC):',
      inicioUTC.toISOString(),
    );
    console.log('[validarInicioyFinReserva] Fin (UTC):', finUTC.toISOString());
    console.log('[validarInicioyFinReserva] Rol:', autorRol);
    console.log(
      '[validarInicioyFinReserva] Tiempo Reserva:',
      recursoTiempoReserva,
    );
    console.log('[validarInicioyFinReserva] ahoraUTC:', ahoraUTC.toISOString());
    console.log(
      '[validarInicioyFinReserva] inicioUTC:',
      inicioUTC.toISOString(),
    );

    // Validación 1: La fecha de inicio debe ser posterior a la fecha actual
    if (inicioUTC < ahoraUTC) {
      // Convertir a hora de Perú para el mensaje de error
      const inicioLima = this.convertirUTCaPeru(inicioUTC);
      const ahoraLima = this.convertirUTCaPeru(ahoraUTC);

      throw new ConflictException(
        `La fecha/hora de inicio: ${inicioLima} debe ser posterior a la fecha/hora actual: ${ahoraLima}`,
      );
    }

    // Validación específica para DOCENTES
    if (autorRol === 'DOCENTE') {
      // Convertir tiempo de reserva de horas a milisegundos
      const tiempoReservaMs = recursoTiempoReserva * 60 * 60 * 1000;
      const tiempoMinimoReservaUTC = new Date(
        ahoraUTC.getTime() + tiempoReservaMs,
      );

      console.log(
        '[validarInicioyFinReserva] Tiempo mínimo reserva (UTC):',
        tiempoMinimoReservaUTC.toISOString(),
      );

      if (inicioUTC < tiempoMinimoReservaUTC) {
        // Convertir a hora de Perú para el mensaje de error
        const inicioLima = this.convertirUTCaPeru(inicioUTC);
        const tiempoMinimoLima = this.convertirUTCaPeru(tiempoMinimoReservaUTC);

        throw new ConflictException(
          `Como DOCENTE, la reserva debe hacerse con al menos ${recursoTiempoReserva} horas de anticipación. ` +
            `La fecha/hora de inicio: ${inicioLima} debe ser posterior a: ${tiempoMinimoLima}`,
        );
      }
    }

    // Validación 3: La fecha de fin debe ser posterior a la fecha de inicio
    if (finUTC <= inicioUTC) {
      throw new ConflictException(
        'La fecha/hora de fin debe ser posterior a la fecha/hora de inicio',
      );
    }
  }

  // Función auxiliar para convertir UTC a hora de Perú (UTC-5)
  private convertirUTCaPeru(fechaUTC: Date): string {
    // Ajustar a la zona horaria de Perú (UTC-5)
    const offsetPeru = -5 * 60; // 5 horas en minutos
    const fechaPeru = new Date(fechaUTC.getTime() + offsetPeru * 60 * 1000);

    return fechaPeru.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private validateReservationDuration(rol: string, inicio: Date, fin: Date) {
    const duracionMin = 45 * 60 * 1000;
    const duracionMaxDocente = 190 * 60 * 1000;
    const duracionMaxAdmin = 23 * 60 * 60 * 1000 + 59 * 60 * 1000;
    const duracion = fin.getTime() - inicio.getTime();

    if (duracion < duracionMin) {
      throw new ConflictException(
        `La duración mínima de reserva es de 45 minutos para todos los roles`,
      );
    }

    switch (rol) {
      case 'ADMINISTRADOR':
        if (duracion > duracionMaxAdmin) {
          throw new ConflictException(
            `La duración máxima para administradores es de 23 horas y 59 minutos`,
          );
        }
        break;
      case 'DOCENTE':
        if (duracion > duracionMaxDocente) {
          throw new ConflictException(
            `La duración máxima para docentes es de 3 horas y 10 minutos`,
          );
        }
        break;
      default:
        throw new ConflictException(`Rol no permitido para reservar: ${rol}`);
    }
  }

  private async validarYAsignarCredenciales(
    recursoId: string,
    inicio: Date,
    fin: Date,
    cantidadGeneral: number,
    cantidadDocente: number,
    credencialesGenerales: Credencial[],
    credencialesDocentes: Credencial[],
    capacidadPorCredencial: number,
  ) {
    // console.log('[DISPONIBILIDAD] Validando y asignando credenciales...');

    // console.log('[Ver rango]', inicio, fin);

    const reservasSolapadas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .innerJoinAndSelect('reserva.detalle_reserva', 'detalle')
      .innerJoinAndSelect('detalle.credencial', 'credencial')
      .where('reserva.recurso_id = :recursoId', { recursoId })
      .andWhere('NOT (reserva.fin <= :inicio OR reserva.inicio >= :fin)', {
        inicio,
        fin,
      })
      .andWhere('reserva.estado = :estado', { estado: 1 })
      .getMany();

    // console.log(
    //   `[DISPONIBILIDAD] Reservas solapadas: ${reservasSolapadas.length}`,
    // );

    // console.log(
    //   `[CREDENCIALES SOLAPADAS] Total reservas encontradas: ${reservasSolapadas}`,
    // );

    const credencialesOcupadas = new Set<string>();
    reservasSolapadas.forEach((reserva) => {
      reserva.detalle_reserva.forEach((detalle) => {
        if (detalle.credencial) {
          credencialesOcupadas.add(detalle.credencial.id);
        }
      });
    });

    // console.log(
    //   `[DISPONIBILIDAD] Credenciales ocupadas: ${credencialesOcupadas.size}`,
    // );

    const generalesDisponibles = credencialesGenerales.filter(
      (c) => !credencialesOcupadas.has(c.id),
    );
    const docentesDisponibles = credencialesDocentes.filter(
      (c) => !credencialesOcupadas.has(c.id),
    );

    // console.log(
    //   `[DISPONIBILIDAD] Generales/Estudiantes disponibles: ${generalesDisponibles.length}, Docentes disponibles: ${docentesDisponibles.length}`,
    // );

    const necesariasGenerales = Math.ceil(
      cantidadGeneral / capacidadPorCredencial,
    );
    const necesariasDocentes = Math.ceil(
      cantidadDocente / capacidadPorCredencial,
    );

    // console.log(
    //   `[DISPONIBILIDAD] Necesarias: Generales/Estudiantes=${necesariasGenerales}, Docentes=${necesariasDocentes}`,
    // );

    if (generalesDisponibles.length < necesariasGenerales) {
      const accesosDisponibles =
        generalesDisponibles.length * capacidadPorCredencial;
      throw new ConflictException(
        `No hay suficientes credenciales generales disponibles. ` +
          `Necesitas ${necesariasGenerales} credencial(es) (para ${cantidadGeneral} acceso(s)), ` +
          `pero solo hay ${generalesDisponibles.length} disponible(s) ` +
          `(equivalente a ${accesosDisponibles} acceso(s)). ` +
          `Cada credencial tiene capacidad para ${capacidadPorCredencial} acceso(s).`,
      );
    }

    if (docentesDisponibles.length < necesariasDocentes) {
      const accesosDisponibles =
        docentesDisponibles.length * capacidadPorCredencial;
      throw new ConflictException(
        `No hay suficientes credenciales docentes disponibles. ` +
          `Necesitas ${necesariasDocentes} credencial(es) (para ${cantidadDocente} acceso(s)), ` +
          `pero solo hay ${docentesDisponibles.length} disponible(s) ` +
          `(equivalente a ${accesosDisponibles} acceso(s)). ` +
          `Cada credencial tiene capacidad para ${capacidadPorCredencial} acceso(s).`,
      );
    }

    return {
      credencialesGeneralesAsignar: generalesDisponibles.slice(
        0,
        necesariasGenerales,
      ),
      credencialesDocentesAsignar: docentesDisponibles.slice(
        0,
        necesariasDocentes,
      ),
    };
  }

  private async saveReservation(
    queryRunner: any,
    reservaData: {
      codigo: string;
      mantenimiento: number;
      inicio: Date;
      fin: Date;
      cantidad_accesos: number;
      cantidad_credenciales: number;
      recurso: Recurso;
      autor: RolUsuario;
      clase?: Clase;
      docente?: RolUsuario;
    },
    credencialesGeneralesAsignar: Credencial[],
    credencialesDocentesAsignar: Credencial[] = [],
  ) {
    const reserva = new Reserva();
    Object.assign(reserva, reservaData);

    const reservaGuardada = await queryRunner.manager.save(reserva);

    const detallesReserva = [
      ...credencialesGeneralesAsignar.map((credencial) =>
        queryRunner.manager.create(DetalleReserva, {
          reserva: { id: reservaGuardada.id },
          credencial: { id: credencial.id },
          tipo: 'general',
        }),
      ),
      ...credencialesDocentesAsignar.map((credencial) =>
        queryRunner.manager.create(DetalleReserva, {
          reserva: { id: reservaGuardada.id },
          credencial: { id: credencial.id },
          tipo: 'docente',
        }),
      ),
    ];

    await queryRunner.manager.save(detallesReserva);
    return reservaGuardada;
  }

  // Métodos específicos para cada tipo de reserva
  async createReservaMantenimientoGeneral(
    createReservaMantenimientoGeneralDto: CreateReservaMantenimientoGeneralDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { inicio, fin, recurso_id, autor_id, cantidad_accesos_general } =
        createReservaMantenimientoGeneralDto;

      const { recurso, autor } = await this.validateBasicReservationData(
        recurso_id,
        autor_id,
        new Date(inicio),
        new Date(fin),
      );

      if (autor.rol.nombre !== 'ADMINISTRADOR') {
        throw new ConflictException(
          'Solo administradores pueden crear reservas en modo mantenimiento',
        );
      }

      const credenciales = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso', 'rol'],
      });

      if (credenciales.length === 0) {
        throw new NotFoundException(
          'El recurso no tiene credenciales configuradas',
        );
      }

      if (
        credenciales.some((credencial) => credencial.rol.nombre !== 'GENERAL')
      ) {
        throw new ConflictException(
          'El recurso no tiene credenciales de tipo GENERAL',
        );
      }

      const capacidadPorCredencial = credenciales[0]?.recurso?.capacidad || 1;

      // En mantenimiento usamos todas las credenciales disponibles
      const credencialesGenerales = credenciales.filter(
        (c) => c.rol.nombre === 'GENERAL',
      );

      const cantidadGeneralFinal = cantidad_accesos_general || 0;

      // const credencialesDocentes = credenciales.filter(
      //   (c) => c.rol.nombre === 'DOCENTE',
      // );

      // const cantidadGeneralFinal =
      //   credencialesGeneralesEstudiantes.length * capacidadPorCredencial;
      // const cantidadDocenteFinal =
      //   credencialesDocentes.length * capacidadPorCredencial;

      const { credencialesGeneralesAsignar } =
        await this.validarYAsignarCredenciales(
          recurso_id,
          inicio,
          fin,
          cantidadGeneralFinal,
          0,
          credencialesGenerales,
          [],
          capacidadPorCredencial,
        );

      const reservaGuardada = await this.saveReservation(
        queryRunner,
        {
          codigo: `RES-${Math.floor(Date.now() / 1000)}`,
          mantenimiento: 1,
          inicio: new Date(inicio),
          fin: new Date(fin),
          // cantidad_accesos:
          //   credencialesGeneralesAsignar.length * capacidadPorCredencial,
          cantidad_accesos: credencialesGeneralesAsignar.length,
          cantidad_credenciales: credencialesGeneralesAsignar.length,
          recurso,
          autor,
        },
        credencialesGeneralesAsignar,
      );

      await queryRunner.commitTransaction();
      return reservaGuardada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createReservaMantenimientoMixto(
    createReservaMantenimientoMixtoDto: CreateReservaMantenimientoMixtoDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        inicio,
        fin,
        recurso_id,
        autor_id,
        cantidad_accesos_general,
        cantidad_accesos_docente,
      } = createReservaMantenimientoMixtoDto;

      const { recurso, autor } = await this.validateBasicReservationData(
        recurso_id,
        autor_id,
        new Date(inicio),
        new Date(fin),
      );

      if (autor.rol.nombre !== 'ADMINISTRADOR') {
        throw new ConflictException(
          'Solo administradores pueden crear reservas en modo mantenimiento',
        );
      }

      const credenciales = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso', 'rol'],
      });

      if (credenciales.length === 0) {
        throw new NotFoundException(
          'El recurso no tiene credenciales configuradas',
        );
      }

      if (
        credenciales.some((credencial) => credencial.rol.nombre === 'GENERAL')
      ) {
        throw new ConflictException(
          'El recurso no debe tener credenciales de tipo GENERAL para reservas de mantenimiento docente/estudiante',
        );
      }

      const capacidadPorCredencial = credenciales[0]?.recurso?.capacidad || 1;

      // En mantenimiento usamos todas las credenciales disponibles
      const credencialesEstudiantes = credenciales.filter(
        (c) => c.rol.nombre === 'ESTUDIANTE',
      );

      const credencialDocentes = credenciales.filter(
        (c) => c.rol.nombre === 'DOCENTE',
      );

      if (
        credencialesEstudiantes.length === 0 &&
        credencialDocentes.length === 0
      ) {
        throw new ConflictException(
          'No se encontraron credenciales de tipo ESTUDIANTE o DOCENTE para este recurso',
        );
      }

      //const cantidadGeneralFinal = cantidad_accesos_general || 0;

      // const credencialesDocentes = credenciales.filter(
      //   (c) => c.rol.nombre === 'DOCENTE',
      // );

      // const cantidadGeneralFinal =
      //   credencialesGeneralesEstudiantes.length * capacidadPorCredencial;
      // const cantidadDocenteFinal =
      //   credencialesDocentes.length * capacidadPorCredencial;

      const {
        credencialesGeneralesAsignar: credencialesEstudiantesAsignar,
        credencialesDocentesAsignar,
      } = await this.validarYAsignarCredenciales(
        recurso_id,
        inicio,
        fin,
        cantidad_accesos_general || 0,
        cantidad_accesos_docente || 0,
        credencialesEstudiantes,
        credencialDocentes,
        capacidadPorCredencial,
      );

      const reservaGuardada = await this.saveReservation(
        queryRunner,
        {
          codigo: `RES-${Math.floor(Date.now() / 1000)}`,
          mantenimiento: 1,
          inicio: new Date(inicio),
          fin: new Date(fin),
          cantidad_accesos:
            credencialesEstudiantesAsignar.length +
            credencialesDocentesAsignar.length,
          cantidad_credenciales:
            credencialesEstudiantesAsignar.length +
            credencialesDocentesAsignar.length,
          recurso,
          autor,
        },
        credencialesEstudiantesAsignar,
        credencialesDocentesAsignar,
      );

      await queryRunner.commitTransaction();
      return reservaGuardada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createReservaGeneral(createReservaGeneralDto: CreateReservaGeneralDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        inicio,
        fin,
        recurso_id,
        autor_id,
        cantidad_accesos_general,
        clase_id,
        docente_id,
      } = createReservaGeneralDto;

      const { recurso, autor } = await this.validateBasicReservationData(
        recurso_id,
        autor_id,
        new Date(inicio),
        new Date(fin),
      );

      let docente;

      const clase = await this.claseRepository.findOneBy({ id: clase_id });
      if (docente_id) {
        docente = await this.rolUsuarioRepository.findOne({
          where: { id: docente_id },
          relations: ['usuario', 'rol'],
        });

        if (!docente) throw new NotFoundException('Docente no encontrado');
        if (docente.rol.nombre !== 'DOCENTE') {
          throw new ConflictException('El docente_id debe ser de rol DOCENTE');
        }
      }

      if (!clase) throw new NotFoundException('Clase no encontrada');

      const credenciales = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso', 'rol'],
      });

      if (credenciales.length === 0) {
        throw new NotFoundException(
          'El recurso no tiene credenciales configuradas',
        );
      }
      //Revisar si las credenciales son de tipo GENERAL
      if (
        credenciales.some((credencial) => credencial.rol.nombre !== 'GENERAL')
      ) {
        throw new ConflictException(
          'El recurso no tiene credenciales de tipo GENERAL',
        );
      }

      const capacidadPorCredencial = credenciales[0]?.recurso?.capacidad || 1;

      // En reserva general solo usamos credenciales GENERAL (no ESTUDIANTE ni DOCENTE)
      const credencialesGenerales = credenciales.filter(
        (c) => c.rol.nombre === 'GENERAL',
      );

      const cantidadGeneralFinal = cantidad_accesos_general || 0;

      const { credencialesGeneralesAsignar } =
        await this.validarYAsignarCredenciales(
          recurso_id,
          inicio,
          fin,
          cantidadGeneralFinal,
          0, // No usamos credenciales docentes en reservas generales
          credencialesGenerales,
          [], // No pasamos credenciales docentes
          capacidadPorCredencial,
        );

      const reservaGuardada = await this.saveReservation(
        queryRunner,
        {
          codigo: `RES-${Math.floor(Date.now() / 1000)}`,
          mantenimiento: 0,
          inicio: new Date(inicio),
          fin: new Date(fin),
          cantidad_accesos: cantidadGeneralFinal,
          cantidad_credenciales: credencialesGeneralesAsignar.length,
          recurso,
          autor,
          clase,
          docente,
        },
        credencialesGeneralesAsignar,
      );

      await queryRunner.commitTransaction();
      return reservaGuardada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createReservaMixto(createReservaMixtoDto: CreateReservaMixtoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        inicio,
        fin,
        recurso_id,
        autor_id,
        cantidad_accesos_general,
        cantidad_accesos_docente,
        clase_id,
        docente_id,
      } = createReservaMixtoDto;

      const { recurso, autor } = await this.validateBasicReservationData(
        recurso_id,
        autor_id,
        new Date(inicio),
        new Date(fin),
      );

      const [clase, docente] = await Promise.all([
        this.claseRepository.findOneBy({ id: clase_id }),
        this.rolUsuarioRepository.findOne({
          where: { id: docente_id },
          relations: ['usuario', 'rol'],
        }),
      ]);

      if (!clase) throw new NotFoundException('Clase no encontrada');
      if (!docente) throw new NotFoundException('Docente no encontrado');
      if (docente.rol.nombre !== 'DOCENTE') {
        throw new ConflictException('El docente_id debe ser de rol DOCENTE');
      }

      const credenciales = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso', 'rol'],
      });

      if (credenciales.length === 0) {
        throw new NotFoundException(
          'El recurso no tiene credenciales configuradas',
        );
      }

      // Validar que no haya credenciales GENERAL
      if (
        credenciales.some((credencial) => credencial.rol.nombre === 'GENERAL')
      ) {
        throw new ConflictException(
          'Este recurso no debe tener credenciales de tipo GENERAL para reservas de docente/estudiante',
        );
      }

      const capacidadPorCredencial = credenciales[0]?.recurso?.capacidad || 1;

      // Separar credenciales por tipo
      const credencialesEstudiantes = credenciales.filter(
        (c) => c.rol.nombre === 'ESTUDIANTE',
      );
      const credencialesDocentes = credenciales.filter(
        (c) => c.rol.nombre === 'DOCENTE',
      );

      if (
        credencialesEstudiantes.length === 0 &&
        credencialesDocentes.length === 0
      ) {
        throw new NotFoundException(
          'No se encontraron credenciales de tipo ESTUDIANTE o DOCENTE para este recurso',
        );
      }

      const {
        credencialesGeneralesAsignar: credencialesEstudiantesAsignar,
        credencialesDocentesAsignar,
      } = await this.validarYAsignarCredenciales(
        recurso_id,
        inicio,
        fin,
        cantidad_accesos_general || 0,
        cantidad_accesos_docente || 0,
        credencialesEstudiantes,
        credencialesDocentes,
        capacidadPorCredencial,
      );

      const reservaGuardada = await this.saveReservation(
        queryRunner,
        {
          codigo: `RES-${Math.floor(Date.now() / 1000)}`,
          mantenimiento: 0,
          inicio: new Date(inicio),
          fin: new Date(fin),
          cantidad_accesos:
            (credencialesEstudiantesAsignar.length +
              credencialesDocentesAsignar.length) *
            capacidadPorCredencial,
          cantidad_credenciales:
            credencialesEstudiantesAsignar.length +
            credencialesDocentesAsignar.length,
          recurso,
          autor,
          clase,
          docente,
        },
        credencialesEstudiantesAsignar,
        credencialesDocentesAsignar,
      );

      await queryRunner.commitTransaction();
      return reservaGuardada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationReservaDto: PaginationReservaDto) {
    try {
      const {
        recurso_id,
        docente_id,
        inicio,
        fin,
        sort_state,
        sort_order,
        sort_expired,
        page = 1,
        limit = 10,
        search,
      } = paginationReservaDto;

      // Validaciones básicas
      if (page < 1)
        throw new BadRequestException('La página debe ser mayor a 0');
      if (limit < 1)
        throw new BadRequestException('El límite debe ser mayor a 0');

      const recurso = await this.recursoRepository.existsBy({ id: recurso_id });
      if (!recurso) {
        throw new NotFoundException('Recurso no encontrado');
      }

      // Crear query builder con joins adecuados
      const query = this.reservaRepository
        .createQueryBuilder('reserva')
        .leftJoinAndSelect('reserva.docente', 'docente')
        .leftJoinAndSelect('docente.usuario', 'usuario')
        .leftJoinAndSelect('reserva.clase', 'clase')
        .leftJoinAndSelect('clase.cursoModalidad', 'cursoModalidad')
        .leftJoinAndSelect('cursoModalidad.curso', 'curso')
        .leftJoinAndSelect('reserva.autor', 'autor')
        .leftJoinAndSelect('autor.rol', 'rolAutor')
        .where('reserva.recurso_id = :recursoId', { recursoId: recurso_id });

      // // Para debugging: obtener count sin paginación
      // const totalCounts = await query.getCount();
      // console.log('Total reservas encontradas:', totalCounts);

      if (docente_id) {
        const docente = await this.rolUsuarioRepository.findOne({
          where: { id: docente_id },
          relations: ['usuario', 'rol'],
        });
        if (!docente) throw new NotFoundException('Docente no encontrado');

        query.andWhere('reserva.docente_id = :docenteId', {
          docenteId: docente_id,
        });
      }
      // Filtro por estado
      if (sort_state !== undefined) {
        query.andWhere('reserva.estado = :estado', { estado: sort_state });
      }

      // Ordenamiento por nombre o fecha
      if (sort_order) {
        switch (sort_order) {
          case 1: // Nombre ASC
            query.orderBy('usuario.nombres', 'ASC');
            break;
          case 2: // Nombre DESC
            query.orderBy('usuario.nombres', 'DESC');
            break;
          case 3: // Fecha ASC
            query.orderBy('reserva.creacion', 'ASC');
            break;
          case 4: // Fecha DESC
            query.orderBy('reserva.creacion', 'DESC');
            break;
          default:
            query.orderBy('reserva.creacion', 'DESC');
        }
      } else {
        query.orderBy('reserva.creacion', 'DESC');
      }

      // Filtro por reservas expiradas/no expiradas
      if (sort_expired) {
        const now = new Date();
        if (sort_expired === 1) {
          // Expiradas
          query.andWhere('reserva.fin < :now', { now });
        } else if (sort_expired === 2) {
          // No expiradas
          query.andWhere('reserva.fin >= :now', { now });
        }
      }

      // Filtro por rango de fechas
      if (inicio && fin) {
        query.andWhere(
          'reserva.creacion <= :fin AND reserva.creacion >= :inicio',
          {
            fin,
            inicio,
          },
        );
      }

      // Filtro por búsqueda por nrc, nombre de curso y nombres de docente
      // Filtro por búsqueda por nrc, nombre de curso y nombres de docente
      if (search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('UPPER(clase.nrc) LIKE UPPER(:search)')
              .orWhere('UPPER(curso.nombre) LIKE UPPER(:search)')
              .orWhere('UPPER(usuario.nombres) LIKE UPPER(:search)')
              .orWhere('UPPER(usuario.apellidos) LIKE UPPER(:search)');
          }),
          { search: `%${search}%` },
        );
      }

      // Obtener resultados y total
      const [reservas, totalCount] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      // console.log('Reservas después de filtros:', totalCount);

      // console.log('Filtros aplicados:', {
      //   recurso_id,
      //   docente_id,
      //   inicio,
      //   fin,
      //   sort_state,
      //   sort_expired,
      //   search,
      // });

      // Mapeo de resultados con los nuevos campos
      const results = reservas.map((reserva) => ({
        id: reserva.id,
        creacion: reserva.creacion,
        codigo: reserva.codigo,
        inicio: reserva.inicio,
        fin: reserva.fin,
        cantidad_accesos: reserva.cantidad_accesos,
        cantidad_credenciales: reserva.cantidad_credenciales,
        docente: reserva.docente
          ? {
              nombres: reserva.docente?.usuario?.nombres,
              apellidos: reserva.docente?.usuario?.apellidos,
            }
          : null,
        clase: reserva.clase
          ? {
              nrc: reserva.clase.nrc,
              nombre_curso: reserva.clase.cursoModalidad.curso.nombre,
            }
          : null,
        autor: {
          rol: reserva.autor?.rol?.nombre, // Asumiendo
        },
      }));

      return {
        results,
        meta: {
          count: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      // Podrías loguear el error aquí
      throw error;
    }
  }

  async findReservasInRange(
    paginationReservaInRangeDto: PaginationReservaInRangeDto,
  ) {
    try {
      const { recurso_id, inicio, fin } = paginationReservaInRangeDto;

      // 1. Obtener el recurso con su capacidad
      const recurso = await this.recursoRepository.findOne({
        where: { id: recurso_id },
        select: ['id', 'capacidad'],
      });

      if (!recurso) {
        throw new NotFoundException('Recurso no encontrado');
      }

      const capacidadPorCredencial = recurso.capacidad || 1;
      // console.log(`[CAPACIDAD] Por credencial: ${capacidadPorCredencial}`);

      // 2. Obtener todas las credenciales del recurso
      const totalCredenciales = await this.credencialRepository.count({
        where: { recurso: { id: recurso_id } },
      });

      // console.log(`[CREDENCIALES TOTALES] ${totalCredenciales}`);

      // 3. Obtener las reservas que se superponen con el rango de fechas solicitado
      const reservasEnRango = await this.reservaRepository
        .createQueryBuilder('reserva')
        .innerJoinAndSelect('reserva.detalle_reserva', 'detalle')
        .innerJoinAndSelect('detalle.credencial', 'credencial')
        .where('reserva.recurso_id = :recursoId', { recursoId: recurso_id })
        .andWhere(
          `(
          (reserva.inicio BETWEEN :inicio AND :fin) OR
          (reserva.fin BETWEEN :inicio AND :fin) OR
          (reserva.inicio <= :inicio AND reserva.fin >= :fin)
        )`,
          { inicio, fin },
        )
        .andWhere('reserva.estado = :estado', { estado: 1 })
        .getMany();

      // console.log(
      //   `[RESERVAS EN RANGO] Total reservas encontradas: ${reservasEnRango.length}`,
      // );

      // 4. Calcular credenciales ocupadas en el rango de fechas
      const credencialesOcupadas = new Set<string>();
      reservasEnRango.forEach((reserva) => {
        reserva.detalle_reserva.forEach((detalle) => {
          if (detalle.credencial) {
            credencialesOcupadas.add(detalle.credencial.id);
          }
        });
      });

      // console.log(
      //   `[CREDENCIALES OCUPADAS] Total: ${credencialesOcupadas.size}`,
      // );

      // 6. Procesar cada reserva para calcular disponibilidad específica
      const reservasConDisponibilidad = reservasEnRango.map((reserva) => {
        // Calcular disponibilidad durante el período de esta reserva específica
        const credencialesOcupadasDuranteReserva = new Set<string>();

        reservasEnRango.forEach((otraReserva) => {
          // Si las reservas se solapan (excluyendo la misma reserva)
          if (
            reserva.id !== otraReserva.id &&
            new Date(otraReserva.inicio) < new Date(reserva.fin) &&
            new Date(otraReserva.fin) > new Date(reserva.inicio)
          ) {
            otraReserva.detalle_reserva.forEach((detalle) => {
              if (detalle.credencial) {
                credencialesOcupadasDuranteReserva.add(detalle.credencial.id);
              }
            });
          }
        });

        // Credenciales usadas por esta reserva
        const credencialesEstaReserva = new Set(
          reserva.detalle_reserva.map((d) => d.credencial?.id).filter(Boolean),
        );

        // Calcular disponibilidad específica para esta reserva
        const credencialesDisponiblesParaReserva = Math.max(
          0,
          totalCredenciales -
            credencialesOcupadasDuranteReserva.size -
            credencialesEstaReserva.size,
        );

        const capacidadDisponibleParaReserva =
          credencialesDisponiblesParaReserva * capacidadPorCredencial;

        return {
          id: reserva.id,
          creacion: reserva.creacion,
          estado: reserva.estado,
          codigo: reserva.codigo,
          mantenimiento: reserva.mantenimiento,
          inicio: reserva.inicio,
          fin: reserva.fin,
          cantidad_accesos: reserva.cantidad_accesos,
          cantidad_credenciales: reserva.cantidad_credenciales,
          disponibles: capacidadDisponibleParaReserva,
          credenciales_disponibles: credencialesDisponiblesParaReserva,
        };
      });

      return reservasConDisponibilidad;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener las reservas');
    }
  }
  // En reserva.service.ts
  async countCredencialesDisponibles(
    credencialesDisponiblesDto: CredencialesDisponiblesDto,
  ) {
    try {
      const { recurso_id, inicio, fin } = credencialesDisponiblesDto;
      // console.log(
      //   `[countCredencialesDisponibles] Inicio - recurso_id: ${recurso_id}, inicio: ${inicio}, fin: ${fin}`,
      // );

      // 1. Validar fechas
      if (fin <= inicio) {
        console.error(
          `[VALIDACIÓN FECHAS] Error: fin (${fin}) <= inicio (${inicio})`,
        );
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la de inicio',
        );
      }

      // 2. Obtener todas las credenciales del recurso
      const credenciales = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso', 'rol'],
      });

      // console.log(`[CREDENCIALES] Total encontradas: ${credenciales.length}`);
      // credenciales.forEach((c, i) => {
      //   console.log(
      //     `[CREDENCIAL ${i}] ID: ${c.id}, Rol: ${c.rol?.nombre || 'Ninguno'}`,
      //   );
      // });

      const totalCredenciales = credenciales.length;

      if (totalCredenciales === 0) {
        // console.log('[SIN CREDENCIALES] No hay credenciales para este recurso');
        return {
          credenciales_disponibles: {
            total: 0,
            generales: 0,
            docentes: 0,
          },
          capacidad: {
            por_credencial: 0,
            general_disponible: 0,
            docente_disponible: 0,
          },
        };
      }

      // // Ajuste de zona horaria (igual que en findAll)
      // const adjustToUTC = (dateString: string) => {
      //   const date = new Date(dateString);
      //   date.setHours(date.getHours() - 5); // UTC-5
      //   return date;
      // };

      // const fechaInicio = adjustToUTC(inicio);
      // const fechaFin = adjustToUTC(fin);

      // 3. Obtener las reservas que se superponen con el rango de fechas solicitado
      const reservasEnRango = await this.reservaRepository
        .createQueryBuilder('reserva')
        .innerJoinAndSelect('reserva.detalle_reserva', 'detalle')
        .innerJoinAndSelect('detalle.credencial', 'credencial')
        .where('reserva.recurso_id = :recursoId', { recursoId: recurso_id })
        .andWhere('reserva.fin > :inicio AND reserva.inicio < :fin', {
          inicio,
          fin,
        })
        .andWhere('reserva.estado = :estado', { estado: 1 })
        .getMany();

      // console.log(
      //   `[RESERVAS EN RANGO] Total reservas encontradas: ${reservasEnRango.length}`,
      // );

      // reservasEnRango.forEach((reserva, i) => {
      // console.log(
      //   `[RESERVA ${i}] ID: ${reserva.id}, Inicio: ${reserva.inicio}, Fin: ${reserva.fin}`,
      // );
      // console.log(
      //   `[DETALLES RESERVA ${i}] Total credenciales usadas: ${reserva.detalle_reserva.length}`,
      // );
      //   reserva.detalle_reserva.forEach((detalle, j) => {
      //     console.log(
      //       `[DETALLE ${i}-${j}] Credencial ID: ${detalle.credencial?.id || 'N/A'}`,
      //     );
      //   });
      // });

      // 4. Calcular credenciales ocupadas en el rango de fechas
      const credencialesOcupadas = new Set<string>();
      reservasEnRango.forEach((reserva) => {
        reserva.detalle_reserva.forEach((detalle) => {
          if (detalle.credencial) {
            // console.log(
            //   `[CREDENCIAL OCUPADA] Agregando credencial ID: ${detalle.credencial.id} de reserva ID: ${reserva.id}`,
            // );
            credencialesOcupadas.add(detalle.credencial.id);
          }
        });
      });

      // console.log(`[TOTAL CREDENCIALES OCUPADAS] ${credencialesOcupadas.size}`);
      // console.log(
      //   '[CREDENCIALES OCUPADAS IDs]:',
      //   Array.from(credencialesOcupadas),
      // );

      // 5. Filtrar disponibilidad por tipo
      const capacidadPorCredencial = credenciales[0].recurso.capacidad;
      // console.log(`[CAPACIDAD] Por credencial: ${capacidadPorCredencial}`);

      const credencialesDisponibles = credenciales.filter(
        (c) => !credencialesOcupadas.has(c.id),
      );

      // console.log(
      //   `[CREDENCIALES DISPONIBLES] Total: ${credencialesDisponibles.length}`,
      // );
      // credencialesDisponibles.forEach((c, i) => {
      //   console.log(
      //     `[DISPONIBLE ${i}] ID: ${c.id}, Rol: ${c.rol?.nombre || 'Ninguno'}`,
      //   );
      // });

      const generalDisponibles = credencialesDisponibles.filter(
        (c) => !c.rol || c.rol.nombre !== 'DOCENTE',
      ).length;

      const docenteDisponibles = credencialesDisponibles.filter(
        (c) => c.rol?.nombre === 'DOCENTE',
      ).length;

      // console.log(
      //   `[RESULTADO FINAL] General disponibles: ${generalDisponibles}, Docente disponibles: ${docenteDisponibles}`,
      // );

      const resultado = {
        credenciales_disponibles: {
          total: credencialesDisponibles.length,
          generales: generalDisponibles,
          docentes: docenteDisponibles,
        },
        capacidad: {
          por_credencial: capacidadPorCredencial,
          general_disponible: generalDisponibles * capacidadPorCredencial,
          docente_disponible: docenteDisponibles * capacidadPorCredencial,
        },
      };

      // console.log('[RESULTADO COMPLETO]:', JSON.stringify(resultado, null, 2));
      return resultado;
    } catch (error) {
      console.error('[ERROR]', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Se requiere el ID de la reserva');
      }

      const reserva = await this.reservaRepository.findOne({
        where: { id },
        relations: [
          'clase',
          'clase.cursoModalidad',
          'clase.cursoModalidad.curso',
          'docente',
          'docente.usuario',
          'autor',
          'autor.usuario',
          'autor.rol',
        ],
      });

      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }

      // Transformación de los datos
      return {
        id: reserva.id,
        creacion: reserva.creacion,
        estado: reserva.estado,
        codigo: reserva.codigo,
        mantenimiento: reserva.mantenimiento,
        inicio: reserva.inicio,
        fin: reserva.fin,
        cantidad_accesos: reserva.cantidad_accesos,
        cantidad_credenciales: reserva.cantidad_credenciales,
        // clase: `${reserva.clase?.cursoModalidad?.curso?.nombre || 'Curso no disponible'} - ${reserva.clase?.nrc || 'N/A'}`,
        clase: reserva.clase
          ? {
              nrc: reserva.clase?.nrc,
              inscritos: reserva.clase?.inscritos,
              codigo_curso: reserva.clase?.cursoModalidad?.curso?.codigo,
              nombre_curso: reserva.clase?.cursoModalidad?.curso.nombre,
            }
          : null,
        docente: reserva.docente
          ? {
              nombres: reserva.docente?.usuario?.nombres,
              apellidos: reserva.docente?.usuario?.apellidos,
            }
          : null,
        autor: {
          rol: reserva.autor?.rol?.nombre,
          nombres: reserva.autor?.usuario?.nombres,
          apellidos: reserva.autor?.usuario?.apellidos,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la reserva');
    }
  }

  // async update(id: string, updateReservaDto: UpdateReservaDto) {
  //   return `This action updates a #${id} reserva`;
  // }

  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Se requiere el ID de la reserva');
      }
      const result = await this.reservaRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where({ id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException('Reserva no encontrada');
      }
      return this.reservaRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la reserva');
    }
  }
}
