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
import { Repository, DataSource, Between, FindOptionsWhere } from 'typeorm';
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

  async create(createReservaDto: CreateReservaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        mantenimiento,
        inicio,
        fin,
        cantidad_accesos,
        recurso_id,
        clase_id,
        docente_id,
        autor_id,
      } = createReservaDto;

      // // 1. Convertir strings ISO a objetos Date
      // const inicioDate = new Date(inicio);
      // const finDate = new Date(fin);

      // Validar que la fecha de fin sea posterior a la de inicio
      if (fin <= inicio) {
        throw new ConflictException(
          'La fecha/hora de fin debe ser posterior a la fecha/hora de inicio',
        );
      }

      // 2. Validar existencia de entidades relacionadas
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

      if (!recurso) throw new NotFoundException('Recurso no encontrado');
      if (!clase) throw new NotFoundException('Clase no encontrado');
      if (!docente) throw new NotFoundException('Rol usuario no encontrado');
      if (!autor) throw new NotFoundException('Rol usuario no encontrado');

      // 3. Validar permisos (DOCENTE)
      if (docente.rol.nombre !== 'DOCENTE') {
        throw new ConflictException('El docente_id no es de rol docente');
      }

      if (
        autor.rol.nombre !== 'DOCENTE' &&
        autor.rol.nombre !== 'ADMINISTRADOR'
      ) {
        throw new ConflictException(
          'El autor_id no es de rol docente o administrador',
        );
      }

      // 4. Obtener todas las credenciales disponibles para el recurso
      const credencialesDisponibles = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso'],
      });

      if (credencialesDisponibles.length === 0) {
        throw new ConflictException(
          'No hay credenciales disponibles para este recurso',
        );
      }

      // 4. Validar que el docente (rol_usuario_id) esté asignado a la clase
      const claseConModalidad = await this.claseRepository.findOne({
        where: { id: clase_id },
        relations: ['cursoModalidad'],
      });
      // console.log('claseConModalidad');
      // console.log(claseConModalidad);

      if (!claseConModalidad)
        throw new NotFoundException('Clase no encontrada');
      if (!claseConModalidad.cursoModalidad)
        throw new NotFoundException(
          'Modalidad de curso no encontrada para la clase',
        );

      // Verificar si el docente es responsable de esta modalidad de curso
      const esResponsable = await this.responsableRepository.findOne({
        where: {
          rolUsuario: { id: docente_id },
          clase: { id: clase_id },
        },
      });

      if (!esResponsable) {
        throw new ConflictException('El docente no está asignado a esta clase');
      }

      // 5. Validar que el recurso esté asignado al curso de la clase
      const cursoModalidad = await this.cursoModalidadRepository.findOne({
        where: { id: claseConModalidad.cursoModalidad.id },
        relations: ['curso'],
      });

      if (!cursoModalidad || !cursoModalidad.curso) {
        throw new NotFoundException('Curso no encontrado para la modalidad');
      }
      //console.log('curso id');
      //console.log(cursoModalidad.curso.id);
      const recursoAsignadoAlCurso = await this.recursoCursoRepository.findOne({
        where: {
          curso: { id: cursoModalidad.curso.id },
          recurso: { id: recurso_id },
        },
      });

      if (!recursoAsignadoAlCurso) {
        throw new ConflictException('El recurso no está asignado a este curso');
      }

      // 6. Validar disponibilidad del recurso
      await this.validarDisponibilidadRecurso(
        recurso_id,
        inicio,
        fin,
        cantidad_accesos,
        credencialesDisponibles,
      );

      // 7. Calcular cantidad de credenciales necesarias
      const capacidadPorCredencial =
        credencialesDisponibles[0].recurso.capacidad;
      const cantidad_credenciales = Math.ceil(
        cantidad_accesos / capacidadPorCredencial,
      );

      // 8. Crear reserva
      const reserva = queryRunner.manager.create(Reserva, {
        codigo: `RES-${Date.now()}`,
        mantenimiento,
        inicio,
        fin,
        cantidad_accesos,
        cantidad_credenciales,
        recurso: { id: recurso_id },
        clase: { id: clase_id },
        docente: { id: docente_id },
        autor: { id: autor_id },
      });

      const reservaGuardada = await queryRunner.manager.save(reserva);

      // 9. Asignar credenciales a la reserva (DetalleReserva)
      const credencialesAsignar = credencialesDisponibles.slice(
        0,
        cantidad_credenciales,
      );

      const detallesReserva = credencialesAsignar.map((credencial) => {
        return queryRunner.manager.create(DetalleReserva, {
          reserva: { id: reservaGuardada.id },
          credencial: { id: credencial.id },
        });
      });

      await queryRunner.manager.save(detallesReserva);

      await queryRunner.commitTransaction();
      return reservaGuardada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validarDisponibilidadRecurso(
    recursoId: string,
    inicio: Date,
    fin: Date,
    cantidadRequerida: number,
    credencialesDisponibles: Credencial[],
  ): Promise<void> {
    // 1. Obtener todas las reservas existentes para este recurso CON RELACIONES
    const reservasExistente = await this.reservaRepository.find({
      where: { recurso: { id: recursoId } },
      relations: ['detalle_reserva', 'detalle_reserva.credencial'], // <- Aquí está el cambio clave
    });

    // Resto del método permanece igual...
    let credencialesOcupadas = new Set<string>();

    reservasExistente.forEach((reserva) => {
      if (
        !(
          new Date(fin) <= new Date(reserva.inicio) ||
          new Date(inicio) >= new Date(reserva.fin)
        )
      ) {
        reserva.detalle_reserva?.forEach((detalle) => {
          if (detalle.credencial?.id) {
            // <- Verificación segura
            credencialesOcupadas.add(detalle.credencial.id);
          }
        });
      }
    });

    // ... resto del método
  }

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

      // 1. Validar fechas
      if (fin <= inicio) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la de inicio',
        );
      }

      // 2. Obtener todas las credenciales del recurso
      const credenciales = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso', 'rol'],
      });

      if (credenciales.length === 0) {
        return {
          total: 0,
          general: 0,
          docente: 0,
          capacidad_por_credencial: 0,
          capacidad_total_disponible: 0,
        };
      }

      // 3. Obtener reservas que se solapan con el rango exacto
      const reservasSolapadas = await this.reservaRepository
        .createQueryBuilder('reserva')
        .innerJoinAndSelect('reserva.detalle_reserva', 'detalle')
        .innerJoinAndSelect('detalle.credencial', 'credencial') // <-- Cambio clave aquí
        .where('reserva.recurso_id = :recursoId', { recursoId: recurso_id })
        .andWhere(
          `(
          (reserva.inicio BETWEEN :inicio AND :fin) OR
          (reserva.fin BETWEEN :inicio AND :fin) OR
          (reserva.inicio <= :inicio AND reserva.fin >= :fin)
        )`,
          { inicio, fin },
        )
        .getMany();

      // 4. Calcular credenciales ocupadas
      const credencialesOcupadas = new Set<string>();
      reservasSolapadas.forEach((reserva) => {
        reserva.detalle_reserva.forEach((detalle) => {
          if (detalle.credencial && detalle.credencial.id) {
            // <-- Validación adicional
            credencialesOcupadas.add(detalle.credencial.id);
          }
        });
      });

      // 5. Filtrar disponibilidad por tipo
      const capacidadPorCredencial = credenciales[0].recurso.capacidad;
      const totalDisponibles = credenciales.filter(
        (c) => !credencialesOcupadas.has(c.id),
      );

      const generalDisponibles = totalDisponibles.filter(
        (c) => c.rol === null || c.rol.nombre !== 'DOCENTE',
      ).length;

      const docenteDisponibles = totalDisponibles.filter(
        (c) => c.rol?.nombre === 'DOCENTE',
      ).length;

      return {
        total: totalDisponibles.length,
        general: generalDisponibles,
        docente: docenteDisponibles,
        capacidad_por_credencial: capacidadPorCredencial,
        capacidad_total_disponible:
          totalDisponibles.length * capacidadPorCredencial,
      };
    } catch (error) {
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
