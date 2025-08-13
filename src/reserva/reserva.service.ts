import { CreateReservaGeneralDto } from './dto/create-reserva-general.dto';
import { PaginationReservaDto } from './dto/pagination-reserva.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservaMantenimientoDto } from './dto/create-reserva.dto';
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

    await this.validarInicioyFinReserva(inicio, fin);
    this.validarTiempoReserva(autor.rol.nombre, inicio, fin);

    return { recurso, autor };
  }

  private async validarInicioyFinReserva(inicio: Date, fin: Date) {
    const ahoraUTC = new Date().toISOString();
    const inicioUTC = new Date(inicio).toISOString();

    if (inicioUTC < ahoraUTC) {
      throw new ConflictException(
        `La fecha/hora de inicio: ${new Date(inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' })} debe ser posterior a la fecha/hora actual: ${new Date(ahoraUTC).toLocaleString('es-PE', { timeZone: 'America/Lima' })}`,
      );
    }

    if (fin <= inicio) {
      throw new ConflictException(
        'La fecha/hora de fin debe ser posterior a la fecha/hora de inicio',
      );
    }
  }

  private validarTiempoReserva(rol: string, inicio: Date, fin: Date) {
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

    const credencialesOcupadas = new Set<string>();
    reservasSolapadas.forEach((reserva) => {
      reserva.detalle_reserva.forEach((detalle) => {
        if (detalle.credencial) {
          credencialesOcupadas.add(detalle.credencial.id);
        }
      });
    });

    const generalesDisponibles = credencialesGenerales.filter(
      (c) => !credencialesOcupadas.has(c.id),
    );
    const docentesDisponibles = credencialesDocentes.filter(
      (c) => !credencialesOcupadas.has(c.id),
    );

    const necesariasGenerales = Math.ceil(
      cantidadGeneral / capacidadPorCredencial,
    );
    const necesariasDocentes = Math.ceil(
      cantidadDocente / capacidadPorCredencial,
    );

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
  async createReservaMantenimiento(
    createReservaMantenimientoDto: CreateReservaMantenimientoDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { inicio, fin, recurso_id, autor_id } =
        createReservaMantenimientoDto;
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

      const capacidadPorCredencial = credenciales[0]?.recurso?.capacidad || 1;

      // En mantenimiento usamos todas las credenciales disponibles
      const credencialesGeneralesEstudiantes = credenciales.filter(
        (c) => c.rol.nombre === 'GENERAL' || c.rol.nombre === 'ESTUDIANTE',
      );
      const credencialesDocentes = credenciales.filter(
        (c) => c.rol.nombre === 'DOCENTE',
      );

      const cantidadGeneralFinal =
        credencialesGeneralesEstudiantes.length * capacidadPorCredencial;
      const cantidadDocenteFinal =
        credencialesDocentes.length * capacidadPorCredencial;

      const { credencialesGeneralesAsignar, credencialesDocentesAsignar } =
        await this.validarYAsignarCredenciales(
          recurso_id,
          new Date(inicio),
          new Date(fin),
          cantidadGeneralFinal,
          cantidadDocenteFinal,
          credencialesGeneralesEstudiantes,
          credencialesDocentes,
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
            (credencialesGeneralesAsignar.length +
              credencialesDocentesAsignar.length) *
            capacidadPorCredencial,
          cantidad_credenciales:
            credencialesGeneralesAsignar.length +
            credencialesDocentesAsignar.length,
          recurso,
          autor,
        },
        credencialesGeneralesAsignar,
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
      //Revisar si las credenciales son de tipo GENERAL
      if (
        credenciales.some((credencial) => credencial.rol.nombre !== 'GENERAL')
      ) {
        throw new ConflictException(
          'Las credenciales deben ser de tipo GENERAL',
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
          new Date(inicio),
          new Date(fin),
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
          cantidad_accesos:
            credencialesGeneralesAsignar.length * capacidadPorCredencial,
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

  async createReservaDocenteEstudiante(
    createReservaMixtoDto: CreateReservaMixtoDto,
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
        new Date(inicio),
        new Date(fin),
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

  // async validarInicioyFinReserva(inicio: Date, fin: Date) {
  //   const ahoraUTC = new Date().toISOString();
  //   const inicioUTC = new Date(inicio).toISOString();
  //   // Validación de fechas
  //   if (inicioUTC < ahoraUTC) {
  //     throw new ConflictException(
  //       `La fecha/hora de inicio: ${new Date(inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' })} debe ser posterior a la fecha/hora actual: ${new Date(ahoraUTC).toLocaleString('es-PE', { timeZone: 'America/Lima' })}`,
  //     );
  //   }

  //   if (fin <= inicio) {
  //     throw new ConflictException(
  //       'La fecha/hora de fin debe ser posterior a la fecha/hora de inicio',
  //     );
  //   }
  // }

  // async create(createReservaDto: CreateReservaMantenimientoDto) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const {
  //       mantenimiento,
  //       inicio,
  //       fin,
  //       cantidad_accesos_general,
  //       cantidad_accesos_docente,
  //       recurso_id,
  //       clase_id,
  //       docente_id,
  //       autor_id,
  //     } = createReservaDto;

  //     console.log(
  //       `[CREATE RESERVA] Inicio - recurso: ${recurso_id}, inicio: ${inicio}, fin: ${fin}`,
  //     );
  //     console.log(
  //       `[PARÁMETROS] Accesos general/estudiante: ${cantidad_accesos_general}, docente: ${cantidad_accesos_docente}`,
  //     );

  //     const ahoraUTC = new Date().toISOString();
  //     const inicioUTC = new Date(inicio).toISOString();
  //     // Validación de fechas
  //     if (inicioUTC < ahoraUTC) {
  //       throw new ConflictException(
  //         `La fecha/hora de inicio: ${new Date(inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' })} debe ser posterior a la fecha/hora actual: ${new Date(ahoraUTC).toLocaleString('es-PE', { timeZone: 'America/Lima' })}`,
  //       );
  //     }

  //     if (fin <= inicio) {
  //       throw new ConflictException(
  //         'La fecha/hora de fin debe ser posterior a la fecha/hora de inicio',
  //       );
  //     }

  //     const [recurso, autor] = await Promise.all([
  //       this.recursoRepository.findOneBy({ id: recurso_id }),
  //       this.rolUsuarioRepository.findOne({
  //         where: { id: autor_id },
  //         relations: ['usuario', 'rol'],
  //       }),
  //     ]);

  //     if (!recurso) {
  //       throw new NotFoundException('Recurso no encontrado');
  //     }
  //     if (!autor) {
  //       throw new NotFoundException('Autor no encontrado');
  //     }

  //     // Si es DOCENTE y está intentando hacer una reserva de mantenimiento
  //     if (autor.rol.nombre === 'DOCENTE' && mantenimiento === 1) {
  //       throw new ConflictException(
  //         'Los docentes no pueden realizar reservas en modo mantenimiento',
  //       );
  //     }

  //     this.validarTiempoReserva(
  //       autor.rol.nombre,
  //       new Date(inicio),
  //       new Date(fin),
  //     );

  //     // Cambiar la declaración inicial para que coincida con los tipos esperados

  //     let clase: Clase | null = null;
  //     let docente: RolUsuario | null = null;

  //     if (mantenimiento == 0) {
  //       // Validar existencia de entidades relacionadas
  //       const results = await Promise.all([
  //         this.claseRepository.findOneBy({ id: clase_id }),
  //         this.rolUsuarioRepository.findOne({
  //           where: { id: docente_id },
  //           relations: ['usuario', 'rol'],
  //         }),
  //       ]);

  //       clase = results[0];
  //       docente = results[1];

  //       if (!docente) {
  //         throw new NotFoundException('Docente no encontrado');
  //       }
  //       if (!clase) {
  //         throw new NotFoundException('Clase no encontrado');
  //       }
  //     }
  //     // if(mantenimiento === 1){
  //     //   if( cantidad_accesos_docente === undefined || cantidad_accesos_general === undefined){
  //     //     throw new ConflictException('Se debe especificar cantidad_accesos_general y cantidad_accesos_docente para reservas en modo mantenimiento');
  //     //   }
  //     // }

  //     console.log(`[AUTOR] Rol: ${autor.rol.nombre}`);
  //     // Validar tiempo mínimo de reserva solo si el autor no es administrador
  //     if (autor.rol.nombre !== 'ADMINISTRADOR') {
  //       await this.validarTiempoMinimoReserva(inicio, recurso.tiempo_reserva);
  //     }

  //     // Obtener TODAS las credenciales del recurso
  //     const credenciales = await this.credencialRepository.find({
  //       where: { recurso: { id: recurso_id } },
  //       relations: ['recurso', 'rol'],
  //     });

  //     console.log(`[CREDENCIALES] Totales: ${credenciales.length}`);

  //     // Capacidad por credencial (asumimos todas tienen la misma capacidad)
  //     const capacidadPorCredencial = credenciales[0]?.recurso?.capacidad || 1;
  //     console.log(`[CAPACIDAD] Por credencial: ${capacidadPorCredencial}`);

  //     // MODIFICACIÓN PRINCIPAL: Lógica para modo mantenimiento
  //     let cantidadGeneralFinal: number;
  //     let cantidadDocenteFinal: number;

  //     if (mantenimiento === 1) {
  //       if (
  //         cantidad_accesos_docente === undefined ||
  //         cantidad_accesos_general === undefined
  //       ) {
  //         // En modo mantenimiento, usar TODAS las credenciales disponibles
  //         cantidadGeneralFinal = credenciales.filter(
  //           (c) => c.rol.nombre === 'GENERAL' || c.rol.nombre === 'ESTUDIANTE',
  //         ).length;
  //         cantidadDocenteFinal = credenciales.filter(
  //           (c) => c.rol.nombre === 'DOCENTE',
  //         ).length;
  //         // Multiplicar por la capacidad para obtener el total de accesos
  //         cantidadGeneralFinal = cantidadGeneralFinal * capacidadPorCredencial;
  //         cantidadDocenteFinal = cantidadDocenteFinal * capacidadPorCredencial;
  //       } else {
  //         // En modo mantenimiento, usar los valores proporcionados
  //         cantidadGeneralFinal = cantidad_accesos_general || 0;
  //         cantidadDocenteFinal = cantidad_accesos_docente || 0;
  //       }
  //     } else {
  //       // Modo normal, usar los valores proporcionados
  //       cantidadGeneralFinal = cantidad_accesos_general || 0;
  //       cantidadDocenteFinal = cantidad_accesos_docente || 0;
  //     }

  //     // Separar en generales/estudiantes (combinados) y docentes
  //     const credencialesGeneralesEstudiantes = credenciales.filter(
  //       (c) => c.rol.nombre === 'GENERAL' || c.rol.nombre === 'ESTUDIANTE',
  //     );
  //     const credencialesDocentes = credenciales.filter(
  //       (c) => c.rol.nombre === 'DOCENTE',
  //     );

  //     console.log(
  //       `[CREDENCIALES] Generales/Estudiantes: ${credencialesGeneralesEstudiantes.length}, Docentes: ${credencialesDocentes.length}`,
  //     );

  //     // // Nueva lógica: Si no hay credenciales docentes pero se solicita acceso docente
  //     // let cantidadGeneralFinal = cantidadGeneral;
  //     // let cantidadDocenteFinal = cantidadDocente;

  //     // if (credencialesDocentes.length === 0 && cantidadDocente > 0) {
  //     //   console.log(
  //     //     `[ADVERTENCIA] El recurso no tiene credenciales docentes, pero se solicitó ${cantidad_accesos_docente} accesos docentes. Se sumarán a los accesos generales.`,
  //     //   );
  //     //   cantidadGeneralFinal += cantidadDocente;
  //     //   cantidadDocenteFinal = 0;
  //     // }

  //     // Validar disponibilidad
  //     const { credencialesGeneralesAsignar, credencialesDocentesAsignar } =
  //       await this.validarYAsignarCredenciales(
  //         recurso_id,
  //         inicio,
  //         fin,
  //         cantidadGeneralFinal,
  //         cantidadDocenteFinal,
  //         credencialesGeneralesEstudiantes,
  //         credencialesDocentes,
  //         capacidadPorCredencial,
  //       );

  //     console.log('[CREDENCIALES ASIGNADAS]', {
  //       generalesEstudiantes: credencialesGeneralesAsignar.map((c) => c.id),
  //       docentes: credencialesDocentesAsignar.map((c) => c.id),
  //     });

  //     const reserva = new Reserva();
  //     reserva.codigo = `RES-${Math.floor(Date.now() / 1000)}`;
  //     reserva.mantenimiento = mantenimiento;
  //     reserva.inicio = inicio;
  //     reserva.fin = fin;
  //     (reserva.cantidad_accesos =
  //       mantenimiento == 1
  //         ? credencialesGeneralesAsignar.length +
  //           credencialesDocentesAsignar.length
  //         : cantidad_accesos_general! + cantidad_accesos_docente!),
  //       (reserva.cantidad_credenciales =
  //         credencialesGeneralesAsignar.length +
  //         credencialesDocentesAsignar.length);
  //     reserva.recurso = recurso;
  //     reserva.autor = autor;

  //     // Solo asignar clase y docente si no es mantenimiento
  //     if (mantenimiento === 0) {
  //       // Usar operador de aserción no nula (!) ya que hemos validado que no son null
  //       reserva.clase = clase!;
  //       reserva.docente = docente!;
  //     }

  //     const reservaGuardada = await queryRunner.manager.save(reserva);

  //     // Crear detalles de reserva
  //     const detallesReserva = [
  //       ...credencialesGeneralesAsignar.map((credencial) =>
  //         queryRunner.manager.create(DetalleReserva, {
  //           reserva: { id: reservaGuardada.id },
  //           credencial: { id: credencial.id },
  //           tipo: 'general',
  //         }),
  //       ),
  //       ...credencialesDocentesAsignar.map((credencial) =>
  //         queryRunner.manager.create(DetalleReserva, {
  //           reserva: { id: reservaGuardada.id },
  //           credencial: { id: credencial.id },
  //           tipo: 'docente',
  //         }),
  //       ),
  //     ];

  //     await queryRunner.manager.save(detallesReserva);
  //     await queryRunner.commitTransaction();
  //     return reservaGuardada;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     console.error('[ERROR]', error);
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  // private validarTiempoReserva(rol: string, inicio: Date, fin: Date) {
  //   // Tiempos en milisegundos
  //   const duracionMin = 45 * 60 * 1000; // 45 minutos mínimo
  //   const duracionMaxDocente = 190 * 60 * 1000; // 3h 10m
  //   const duracionMaxAdmin = 23 * 60 * 60 * 1000 + 59 * 60 * 1000; // 23:59h
  //   const duracionMaxDefault = 4 * 60 * 60 * 1000; // 4h para otros roles

  //   const duracion = fin.getTime() - inicio.getTime();

  //   // Validación mínima para todos los roles
  //   if (duracion < duracionMin) {
  //     throw new ConflictException(
  //       `La duración mínima de reserva es de 45 minutos para todos los roles`,
  //     );
  //   }

  //   // Validación por rol
  //   switch (rol) {
  //     case 'ADMINISTRADOR':
  //       if (duracion > duracionMaxAdmin) {
  //         throw new ConflictException(
  //           `La duración máxima para administradores es de 23 horas y 59 minutos`,
  //         );
  //       }
  //       break;

  //     case 'DOCENTE':
  //       if (duracion > duracionMaxDocente) {
  //         throw new ConflictException(
  //           `La duración máxima para docentes es de 3 horas y 10 minutos`,
  //         );
  //       }
  //       break;

  //     default:
  //       throw new ConflictException(`Rol no permitido para reservar: ${rol}`);
  //   }
  // }

  // private async validarYAsignarCredenciales(
  //   recursoId: string,
  //   inicio: Date,
  //   fin: Date,
  //   cantidadGeneral: number,
  //   cantidadDocente: number,
  //   credencialesGeneralesEstudiantes: Credencial[],
  //   credencialesDocentes: Credencial[],
  //   capacidadPorCredencial: number,
  // ) {
  //   console.log('[DISPONIBILIDAD] Validando y asignando credenciales...');

  //   console.log('[Ver rango]', inicio, fin);

  //   // 1. Obtener reservas existentes en el rango
  //   const reservasSolapadas = await this.reservaRepository
  //     .createQueryBuilder('reserva')
  //     .innerJoinAndSelect('reserva.detalle_reserva', 'detalle')
  //     .innerJoinAndSelect('detalle.credencial', 'credencial')
  //     .where('reserva.recurso_id = :recursoId', { recursoId })
  //     .andWhere('NOT (reserva.fin <= :inicio OR reserva.inicio >= :fin)', {
  //       inicio,
  //       fin,
  //     })
  //     .andWhere('reserva.estado = :estado', { estado: 1 })
  //     .getMany();

  //   console.log(
  //     `[DISPONIBILIDAD] Reservas solapadas: ${reservasSolapadas.length}`,
  //   );

  //   // 2. Identificar credenciales ocupadas
  //   const credencialesOcupadas = new Set<string>();
  //   reservasSolapadas.forEach((reserva) => {
  //     reserva.detalle_reserva.forEach((detalle) => {
  //       if (detalle.credencial) {
  //         credencialesOcupadas.add(detalle.credencial.id);
  //       }
  //     });
  //   });

  //   console.log(
  //     `[DISPONIBILIDAD] Credenciales ocupadas: ${credencialesOcupadas.size}`,
  //   );

  //   // 3. Filtrar credenciales disponibles
  //   const generalesDisponibles = credencialesGeneralesEstudiantes.filter(
  //     (c) => !credencialesOcupadas.has(c.id),
  //   );
  //   const docentesDisponibles = credencialesDocentes.filter(
  //     (c) => !credencialesOcupadas.has(c.id),
  //   );

  //   console.log(
  //     `[DISPONIBILIDAD] Generales/Estudiantes disponibles: ${generalesDisponibles.length}, Docentes disponibles: ${docentesDisponibles.length}`,
  //   );

  //   // 4. Calcular cuántas credenciales necesitamos
  //   const necesariasGenerales = Math.ceil(
  //     cantidadGeneral / capacidadPorCredencial,
  //   );
  //   const necesariasDocentes = Math.ceil(
  //     cantidadDocente / capacidadPorCredencial,
  //   );

  //   console.log(
  //     `[DISPONIBILIDAD] Necesarias: Generales/Estudiantes=${necesariasGenerales}, Docentes=${necesariasDocentes}`,
  //   );

  //   // 5. Validar disponibilidad
  //   if (generalesDisponibles.length < necesariasGenerales) {
  //     const accesosDisponibles =
  //       generalesDisponibles.length * capacidadPorCredencial;
  //     throw new ConflictException(
  //       `No hay suficientes credenciales generales/estudiantes disponibles. ` +
  //         `Necesitas ${necesariasGenerales} credencial(es) (para ${cantidadGeneral} acceso(s)), ` +
  //         `pero solo hay ${generalesDisponibles.length} disponible(s) ` +
  //         `(equivalente a ${accesosDisponibles} acceso(s)). ` +
  //         `Cada credencial tiene capacidad para ${capacidadPorCredencial} acceso(s).`,
  //     );
  //   }

  //   if (docentesDisponibles.length < necesariasDocentes) {
  //     const accesosDisponibles =
  //       docentesDisponibles.length * capacidadPorCredencial;
  //     throw new ConflictException(
  //       `No hay suficientes credenciales docentes disponibles. ` +
  //         `Necesitas ${necesariasDocentes} credencial(es) (para ${cantidadDocente} acceso(s)), ` +
  //         `pero solo hay ${docentesDisponibles.length} disponible(s) ` +
  //         `(equivalente a ${accesosDisponibles} acceso(s)). ` +
  //         `Cada credencial tiene capacidad para ${capacidadPorCredencial} acceso(s).`,
  //     );
  //   }

  //   // 6. Seleccionar las credenciales a asignar (las primeras disponibles)
  //   return {
  //     credencialesGeneralesAsignar: generalesDisponibles.slice(
  //       0,
  //       necesariasGenerales,
  //     ),
  //     credencialesDocentesAsignar: docentesDisponibles.slice(
  //       0,
  //       necesariasDocentes,
  //     ),
  //   };
  // }

  // private async validarTiempoMinimoReserva(
  //   fechaInicioReserva: Date,
  //   tiempoReservaHoras: number,
  // ) {
  //   if (tiempoReservaHoras <= 0) {
  //     return;
  //   }

  //   // Asegurarnos que trabajamos con fechas en UTC
  //   const ahoraUTC = new Date().toISOString();
  //   const fechaInicioUTC = new Date(fechaInicioReserva).toISOString();

  //   const fechaMinimaPermitida = new Date(
  //     new Date(ahoraUTC).getTime() + tiempoReservaHoras * 60 * 60 * 1000,
  //   );

  //   console.log(`[VALIDACIÓN HORARIA]`, {
  //     ahoraUTC,
  //     fechaInicioUTC,
  //     fechaMinimaPermitida: fechaMinimaPermitida.toISOString(),
  //     tiempoReservaHoras,
  //   });

  //   if (new Date(fechaInicioUTC) < fechaMinimaPermitida) {
  //     throw new ConflictException(
  //       `Las reservas para este recurso deben hacerse con al menos ${tiempoReservaHoras} horas de anticipación. ` +
  //         `La reserva más temprana permitida es a partir de ${fechaMinimaPermitida.toLocaleString('es-PE', { timeZone: 'America/Lima' })}. ` +
  //         `(Intento de reserva para ${new Date(fechaInicioUTC).toLocaleString('es-PE', { timeZone: 'America/Lima' })})`,
  //     );
  //   }
  // }

  // private async validarDisponibilidadRecurso(
  //   recursoId: string,
  //   inicio: Date,
  //   fin: Date,
  //   cantidadGeneral: number,
  //   cantidadDocente: number,
  //   credencialesGenerales: Credencial[],
  //   credencialesDocentes: Credencial[],
  //   usarSoloGenerales: boolean,
  // ): Promise<void> {
  //   // Validar que haya credenciales
  //   if (
  //     credencialesGenerales.length === 0 &&
  //     credencialesDocentes.length === 0
  //   ) {
  //     throw new ConflictException(
  //       'No hay credenciales disponibles para este recurso',
  //     );
  //   }

  //   // Obtener capacidades
  //   const capacidadGeneral = credencialesGenerales[0]?.recurso?.capacidad || 1;
  //   const capacidadDocente = credencialesDocentes[0]?.recurso?.capacidad || 1;

  //   // Obtener reservas solapadas (usando misma lógica que GET)
  //   const reservasSolapadas = await this.reservaRepository
  //     .createQueryBuilder('reserva')
  //     .innerJoinAndSelect('reserva.detalle_reserva', 'detalle')
  //     .innerJoinAndSelect('detalle.credencial', 'credencial')
  //     .where('reserva.recurso_id = :recursoId', { recursoId })
  //     .andWhere(
  //       `(
  //           (reserva.inicio BETWEEN :inicio AND :fin) OR
  //           (reserva.fin BETWEEN :inicio AND :fin) OR
  //           (reserva.inicio <= :inicio AND reserva.fin >= :fin)
  //       )`,
  //       { inicio, fin },
  //     )
  //     .getMany();

  //   // Calcular ocupación
  //   const generalesOcupadas = new Set<string>();
  //   const docentesOcupadas = new Set<string>();

  //   reservasSolapadas.forEach((reserva) => {
  //     reserva.detalle_reserva?.forEach((detalle) => {
  //       if (!detalle.credencial) return;

  //       if (detalle.credencial.rol?.nombre === 'DOCENTE') {
  //         docentesOcupadas.add(detalle.credencial.id);
  //       } else {
  //         generalesOcupadas.add(detalle.credencial.id);
  //       }
  //     });
  //   });

  //   // Validar disponibilidad
  //   if (usarSoloGenerales) {
  //     const disponibles = credencialesGenerales.length - generalesOcupadas.size;
  //     const necesarias = Math.ceil(
  //       (cantidadGeneral + cantidadDocente) / capacidadGeneral,
  //     );

  //     if (disponibles < necesarias) {
  //       throw new ConflictException(
  //         `No hay suficientes credenciales generales disponibles (${disponibles} disponibles, ${necesarias} necesarias)`,
  //       );
  //     }
  //   } else {
  //     const disponiblesGenerales =
  //       credencialesGenerales.length - generalesOcupadas.size;
  //     const disponiblesDocentes =
  //       credencialesDocentes.length - docentesOcupadas.size;

  //     const necesariasGenerales = Math.ceil(cantidadGeneral / capacidadGeneral);
  //     const necesariasDocentes = Math.ceil(cantidadDocente / capacidadDocente);

  //     if (disponiblesGenerales < necesariasGenerales) {
  //       throw new ConflictException(
  //         `No hay suficientes credenciales generales (${disponiblesGenerales} disponibles, ${necesariasGenerales} necesarias)`,
  //       );
  //     }

  //     if (disponiblesDocentes < necesariasDocentes) {
  //       throw new ConflictException(
  //         `No hay suficientes credenciales docentes (${disponiblesDocentes} disponibles, ${necesariasDocentes} necesarias)`,
  //       );
  //     }
  //   }
  // }
  async findAll(paginationReservaDto: PaginationReservaDto) {
    try {
      const {
        recurso_id,
        inicio,
        fin,
        sort_state = 1,
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
        .leftJoinAndSelect('reserva.clase', 'clase') // Agregado para clase
        .leftJoinAndSelect('clase.cursoModalidad', 'cursoModalidad') // Asumiendo que Clase tiene relación con CursoModalidad
        .leftJoinAndSelect('cursoModalidad.curso', 'curso') // Asumiendo que CursoModalidad tiene relación con Curso
        .leftJoinAndSelect('reserva.autor', 'autor') // Agregado para autor
        .leftJoinAndSelect('autor.rol', 'rolAutor') // Asumiendo que RolUsuario tiene relación con Rol
        .where('reserva.recurso_id = :recursoId', { recursoId: recurso_id });

      // Filtro por estado
      if (sort_state !== undefined) {
        query.andWhere('reserva.estado = :estado', { estado: sort_state });
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
      console.log(`[CAPACIDAD] Por credencial: ${capacidadPorCredencial}`);

      // 2. Obtener todas las credenciales del recurso
      const totalCredenciales = await this.credencialRepository.count({
        where: { recurso: { id: recurso_id } },
      });

      console.log(`[CREDENCIALES TOTALES] ${totalCredenciales}`);

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

      console.log(
        `[RESERVAS EN RANGO] Total reservas encontradas: ${reservasEnRango.length}`,
      );

      // 4. Calcular credenciales ocupadas en el rango de fechas
      const credencialesOcupadas = new Set<string>();
      reservasEnRango.forEach((reserva) => {
        reserva.detalle_reserva.forEach((detalle) => {
          if (detalle.credencial) {
            credencialesOcupadas.add(detalle.credencial.id);
          }
        });
      });

      console.log(
        `[CREDENCIALES OCUPADAS] Total: ${credencialesOcupadas.size}`,
      );

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
      console.log(
        `[countCredencialesDisponibles] Inicio - recurso_id: ${recurso_id}, inicio: ${inicio}, fin: ${fin}`,
      );

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

      console.log(`[CREDENCIALES] Total encontradas: ${credenciales.length}`);
      credenciales.forEach((c, i) => {
        console.log(
          `[CREDENCIAL ${i}] ID: ${c.id}, Rol: ${c.rol?.nombre || 'Ninguno'}`,
        );
      });

      const totalCredenciales = credenciales.length;

      if (totalCredenciales === 0) {
        console.log('[SIN CREDENCIALES] No hay credenciales para este recurso');
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

      console.log(
        `[RESERVAS EN RANGO] Total reservas encontradas: ${reservasEnRango.length}`,
      );

      reservasEnRango.forEach((reserva, i) => {
        console.log(
          `[RESERVA ${i}] ID: ${reserva.id}, Inicio: ${reserva.inicio}, Fin: ${reserva.fin}`,
        );
        console.log(
          `[DETALLES RESERVA ${i}] Total credenciales usadas: ${reserva.detalle_reserva.length}`,
        );
        reserva.detalle_reserva.forEach((detalle, j) => {
          console.log(
            `[DETALLE ${i}-${j}] Credencial ID: ${detalle.credencial?.id || 'N/A'}`,
          );
        });
      });

      // 4. Calcular credenciales ocupadas en el rango de fechas
      const credencialesOcupadas = new Set<string>();
      reservasEnRango.forEach((reserva) => {
        reserva.detalle_reserva.forEach((detalle) => {
          if (detalle.credencial) {
            console.log(
              `[CREDENCIAL OCUPADA] Agregando credencial ID: ${detalle.credencial.id} de reserva ID: ${reserva.id}`,
            );
            credencialesOcupadas.add(detalle.credencial.id);
          }
        });
      });

      console.log(`[TOTAL CREDENCIALES OCUPADAS] ${credencialesOcupadas.size}`);
      console.log(
        '[CREDENCIALES OCUPADAS IDs]:',
        Array.from(credencialesOcupadas),
      );

      // 5. Filtrar disponibilidad por tipo
      const capacidadPorCredencial = credenciales[0].recurso.capacidad;
      console.log(`[CAPACIDAD] Por credencial: ${capacidadPorCredencial}`);

      const credencialesDisponibles = credenciales.filter(
        (c) => !credencialesOcupadas.has(c.id),
      );

      console.log(
        `[CREDENCIALES DISPONIBLES] Total: ${credencialesDisponibles.length}`,
      );
      credencialesDisponibles.forEach((c, i) => {
        console.log(
          `[DISPONIBLE ${i}] ID: ${c.id}, Rol: ${c.rol?.nombre || 'Ninguno'}`,
        );
      });

      const generalDisponibles = credencialesDisponibles.filter(
        (c) => !c.rol || c.rol.nombre !== 'DOCENTE',
      ).length;

      const docenteDisponibles = credencialesDisponibles.filter(
        (c) => c.rol?.nombre === 'DOCENTE',
      ).length;

      console.log(
        `[RESULTADO FINAL] General disponibles: ${generalDisponibles}, Docente disponibles: ${docenteDisponibles}`,
      );

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

      console.log('[RESULTADO COMPLETO]:', JSON.stringify(resultado, null, 2));
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
