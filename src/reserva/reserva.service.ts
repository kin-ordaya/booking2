import { PaginationReservaDto } from './dto/pagination-reserva.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import {
  Repository,
  DataSource,
  Between,
  LessThan,
  IsNull,
  MoreThan,
} from 'typeorm';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Credencial } from 'src/credencial/entities/credencial.entity';
import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';
import { RecursoCurso } from 'src/recurso_curso/entities/recurso_curso.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';
import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';
import { CredencialesDisponiblesDto } from './dto/credenciales-disponibles-reserva.dto';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(DetalleReserva)
    private readonly detalleReservaRepository: Repository<DetalleReserva>,

    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(RecursoCurso)
    private readonly recursoCursoRepository: Repository<RecursoCurso>,

    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,

    @InjectRepository(CursoModalidad)
    private readonly cursoModalidadRepository: Repository<CursoModalidad>,

    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,

    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,

    @InjectRepository(Responsable)
    private readonly responsableRepository: Repository<Responsable>,

    private readonly dataSource: DataSource,
  ) {}

  //TODO Agregar un campo mas de accesos deben ser tanto para docente y estudiantes o generales
  async create(createReservaDto: CreateReservaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        mantenimiento,
        inicio,
        fin,
        cantidad_accesos_general,
        cantidad_accesos_docente,
        recurso_id,
        clase_id,
        docente_id,
        autor_id,
      } = createReservaDto;

      console.log(
        `[CREATE RESERVA] Inicio - recurso: ${recurso_id}, inicio: ${inicio}, fin: ${fin}`,
      );
      console.log(
        `[PARÁMETROS] Accesos general/estudiante: ${cantidad_accesos_general}, docente: ${cantidad_accesos_docente}`,
      );

      // Validación de fechas
      if (fin <= inicio) {
        throw new ConflictException(
          'La fecha/hora de fin debe ser posterior a la fecha/hora de inicio',
        );
      }

      // Validar existencia de entidades relacionadas
      const [recurso, clase, docente, autor] = await Promise.all([
        this.recursoRepository.findOneBy({ id: recurso_id }),
        this.claseRepository.findOneBy({ id: clase_id }),
        this.rolUsuarioRepository.findOne({
          where: { id: docente_id },
          relations: ['usuario', 'rol'],
        }),
        this.rolUsuarioRepository.findOne({
          where: { id: autor_id },
          relations: ['usuario', 'rol'],
        }),
      ]);

      // ... (resto de validaciones de existencia)

      // Obtener TODAS las credenciales del recurso
      const credenciales = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso', 'rol'],
      });

      console.log(`[CREDENCIALES] Totales: ${credenciales.length}`);

      // Separar en generales/estudiantes (combinados) y docentes
      const credencialesGeneralesEstudiantes = credenciales.filter(
        (c) => c.rol.nombre === 'GENERAL' || c.rol.nombre === 'ESTUDIANTE',
      );
      const credencialesDocentes = credenciales.filter(
        (c) => c.rol.nombre === 'DOCENTE',
      );

      console.log(
        `[CREDENCIALES] Generales/Estudiantes: ${credencialesGeneralesEstudiantes.length}, Docentes: ${credencialesDocentes.length}`,
      );

      // Capacidad por credencial (asumimos todas tienen la misma capacidad)
      const capacidadPorCredencial = credenciales[0]?.recurso?.capacidad || 1;
      console.log(`[CAPACIDAD] Por credencial: ${capacidadPorCredencial}`);

      // Validar disponibilidad
      const { credencialesGeneralesAsignar, credencialesDocentesAsignar } =
        await this.validarYAsignarCredenciales(
          recurso_id,
          inicio,
          fin,
          cantidad_accesos_general,
          cantidad_accesos_docente,
          credencialesGeneralesEstudiantes,
          credencialesDocentes,
          capacidadPorCredencial,
        );

      console.log('[CREDENCIALES ASIGNADAS]', {
        generalesEstudiantes: credencialesGeneralesAsignar.map((c) => c.id),
        docentes: credencialesDocentesAsignar.map((c) => c.id),
      });

      // Crear reserva
      const reserva = queryRunner.manager.create(Reserva, {
        codigo: `RES-${Date.now()}`,
        mantenimiento,
        inicio,
        fin,
        //TODO: Evaluar si la entidad reserva debe tener un campo cantidad_accesos_general y cantidad_accesos_docente
        cantidad_accesos: cantidad_accesos_general + cantidad_accesos_docente,
        cantidad_credenciales:
          credencialesGeneralesAsignar.length +
          credencialesDocentesAsignar.length,
        recurso: { id: recurso_id },
        clase: { id: clase_id },
        docente: { id: docente_id },
        autor: { id: autor_id },
      });

      const reservaGuardada = await queryRunner.manager.save(reserva);

      // Crear detalles de reserva
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
      await queryRunner.commitTransaction();
      return reservaGuardada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('[ERROR]', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validarYAsignarCredenciales(
    recursoId: string,
    inicio: Date,
    fin: Date,
    cantidadGeneral: number,
    cantidadDocente: number,
    credencialesGeneralesEstudiantes: Credencial[],
    credencialesDocentes: Credencial[],
    capacidadPorCredencial: number,
  ) {
    console.log('[DISPONIBILIDAD] Validando y asignando credenciales...');

    // 1. Obtener reservas existentes en el rango
    const reservasSolapadas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .innerJoinAndSelect('reserva.detalle_reserva', 'detalle')
      .innerJoinAndSelect('detalle.credencial', 'credencial')
      .where('reserva.recurso_id = :recursoId', { recursoId })
      .andWhere('NOT (reserva.fin <= :inicio OR reserva.inicio >= :fin)', {
        inicio,
        fin,
      })
      .getMany();

    console.log(
      `[DISPONIBILIDAD] Reservas solapadas: ${reservasSolapadas.length}`,
    );

    // 2. Identificar credenciales ocupadas
    const credencialesOcupadas = new Set<string>();
    reservasSolapadas.forEach((reserva) => {
      reserva.detalle_reserva.forEach((detalle) => {
        if (detalle.credencial) {
          credencialesOcupadas.add(detalle.credencial.id);
        }
      });
    });

    console.log(
      `[DISPONIBILIDAD] Credenciales ocupadas: ${credencialesOcupadas.size}`,
    );

    // 3. Filtrar credenciales disponibles
    const generalesDisponibles = credencialesGeneralesEstudiantes.filter(
      (c) => !credencialesOcupadas.has(c.id),
    );
    const docentesDisponibles = credencialesDocentes.filter(
      (c) => !credencialesOcupadas.has(c.id),
    );

    console.log(
      `[DISPONIBILIDAD] Generales/Estudiantes disponibles: ${generalesDisponibles.length}, Docentes disponibles: ${docentesDisponibles.length}`,
    );

    // 4. Calcular cuántas credenciales necesitamos
    const necesariasGenerales = Math.ceil(
      cantidadGeneral / capacidadPorCredencial,
    );
    const necesariasDocentes = Math.ceil(
      cantidadDocente / capacidadPorCredencial,
    );

    console.log(
      `[DISPONIBILIDAD] Necesarias: Generales/Estudiantes=${necesariasGenerales}, Docentes=${necesariasDocentes}`,
    );

    // 5. Validar disponibilidad
    if (generalesDisponibles.length < necesariasGenerales) {
      throw new ConflictException(
        `No hay suficientes credenciales generales/estudiantes disponibles (${generalesDisponibles.length} disponibles, ${necesariasGenerales} necesarias)`,
      );
    }

    if (docentesDisponibles.length < necesariasDocentes) {
      throw new ConflictException(
        `No hay suficientes credenciales docentes disponibles (${docentesDisponibles.length} disponibles, ${necesariasDocentes} necesarias)`,
      );
    }

    // 6. Seleccionar las credenciales a asignar (las primeras disponibles)
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
      const { recurso_id, inicio, fin } = paginationReservaDto;

      // Validación de parámetros requeridos
      if (!recurso_id || !inicio || !fin) {
        throw new BadRequestException('Se requieren recurso_id, inicio y fin');
      }

      // Convertir fechas
      const fechaInicio = new Date(inicio);
      const fechaFin = new Date(fin);
      fechaFin.setHours(23, 59, 59, 999);

      // Obtener el total de credenciales del recurso
      const totalCredenciales = await this.credencialRepository.count({
        where: { recurso: { id: recurso_id } },
      });

      // Obtener todas las reservas en el rango solicitado
      const reservas = await this.reservaRepository.find({
        where: {
          recurso: { id: recurso_id },
          inicio: Between(fechaInicio, fechaFin),
        },
        order: { creacion: 'DESC' },
      });

      // Procesar cada reserva para calcular disponibilidad
      const reservasConDisponibilidad = await Promise.all(
        reservas.map(async (reserva) => {
          // Contar credenciales usadas en reservas que se solapan
          const credencialesUsadas = await this.detalleReservaRepository
            .createQueryBuilder('detalle')
            .innerJoin('detalle.reserva', 'reserva')
            .where('reserva.recurso_id = :recursoId', { recursoId: recurso_id })
            .andWhere(
              'NOT (reserva.fin <= :inicio OR reserva.inicio >= :fin)',
              {
                inicio: reserva.inicio,
                fin: reserva.fin,
              },
            )
            .getCount();

          // Calcular disponibilidad (total - usadas)
          const disponibles = totalCredenciales - credencialesUsadas;

          return {
            ...reserva,
            disponibles,
          };
        }),
      );

      return reservasConDisponibilidad;
    } catch (error) {
      if (error instanceof BadRequestException) {
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

      // 3. Obtener las reservas que se superponen con el rango de fechas solicitado
      const reservasEnRango = await this.reservaRepository
        .createQueryBuilder('reserva')
        .innerJoinAndSelect('reserva.detalle_reserva', 'detalle')
        .innerJoinAndSelect('detalle.credencial', 'credencial')
        .where('reserva.recurso_id = :recursoId', { recursoId: recurso_id })
        .andWhere('NOT (reserva.fin <= :inicio OR reserva.inicio >= :fin)', {
          inicio,
          fin,
        })
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
    return `This action returns a #${id} reserva`;
  }

  async update(id: string, updateReservaDto: UpdateReservaDto) {
    return `This action updates a #${id} reserva`;
  }

  async remove(id: string) {
    return `This action removes a #${id} reserva`;
  }
}
