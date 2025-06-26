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
import { Repository, DataSource } from 'typeorm';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Credencial } from 'src/credencial/entities/credencial.entity';
import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';

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

    @InjectRepository(DetalleReserva)
    private readonly detalleReservaRepository: Repository<DetalleReserva>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createReservaDto: CreateReservaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        mantenimiento,
        descripcion,
        inicio,
        fin,
        cantidad_accesos,
        recurso_id,
        clase_id,
        rol_usuario_id,
      } = createReservaDto;

      // 1. Convertir a minutos para comparación
      const [inicioHours, inicioMins] = inicio.split(':').map(Number);
      const [finHours, finMins] = fin.split(':').map(Number);
      const inicioTotalMins = inicioHours * 60 + inicioMins;
      const finTotalMins = finHours * 60 + finMins;

      if (inicioTotalMins >= finTotalMins) {
        throw new ConflictException(
          'La hora de fin debe ser posterior a la hora de inicio',
        );
      }

      // 2. Validar existencia de entidades relacionadas
      const [recurso, clase, rolUsuario] = await Promise.all([
        this.recursoRepository.findOneBy({ id: recurso_id }),
        this.claseRepository.findOneBy({ id: clase_id }),
        this.rolUsuarioRepository.findOne({
          where: { id: rol_usuario_id },
          relations: ['usuario', 'rol'],
        }),
      ]);

      if (!recurso) throw new NotFoundException('Recurso no encontrado');
      if (!clase) throw new NotFoundException('Clase no encontrado');
      if (!rolUsuario) throw new NotFoundException('Rol usuario no encontrado');

      // 3. Validar permisos (solo ADMINISTRADOR o DOCENTE)
      if (
        rolUsuario.rol.nombre !== 'ADMINISTRADOR' &&
        rolUsuario.rol.nombre !== 'DOCENTE'
      ) {
        throw new ConflictException('No tiene permisos para crear reserva');
      }

      // 4. Obtener todas las credenciales disponibles para el recurso
      const credencialesDisponibles = await this.credencialRepository.find({
        where: { recurso: { id: recurso_id } },
        relations: ['recurso'],
      });

      if (credencialesDisponibles.length === 0) {
        throw new ConflictException('No hay credenciales disponibles para este recurso');
      }

      // 5. Calcular la capacidad total del recurso
      const capacidadTotal = credencialesDisponibles.reduce(
        (total, credencial) => total + credencial.recurso.capacidad,
        0
      );

      // 6. Validar disponibilidad del recurso
      await this.validarDisponibilidadRecurso(
        recurso_id,
        inicio,
        fin,
        cantidad_accesos,
        credencialesDisponibles,
      );

      // 7. Calcular cantidad de credenciales necesarias
      const capacidadPorCredencial = credencialesDisponibles[0].recurso.capacidad;
      const cantidad_credenciales = Math.ceil(cantidad_accesos / capacidadPorCredencial);

      // 8. Crear reserva
      const reserva = queryRunner.manager.create(Reserva, {
        mantenimiento,
        descripcion,
        inicio,
        fin,
        cantidad_accesos,
        cantidad_credenciales,
        recurso: { id: recurso_id },
        clase: { id: clase_id },
        rolUsuario: { id: rol_usuario_id },
      });

      const reservaGuardada = await queryRunner.manager.save(reserva);

      // 9. Asignar credenciales a la reserva (DetalleReserva)
      const credencialesAsignar = credencialesDisponibles.slice(0, cantidad_credenciales);
      
      const detallesReserva = credencialesAsignar.map(credencial => {
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
      throw new InternalServerErrorException('Error inesperado');
    } finally {
      await queryRunner.release();
    }
  }

  private async validarDisponibilidadRecurso(
    recursoId: string,
    inicio: string,
    fin: string,
    cantidadRequerida: number,
    credencialesDisponibles: Credencial[]
  ): Promise<void> {
    // 1. Obtener todas las reservas existentes para este recurso en la misma fecha
    const reservasExistente = await this.reservaRepository.find({
      where: { recurso: { id: recursoId } },
      relations: ['detalle_reserva'],
    });

    // 2. Calcular capacidad total del recurso
    const capacidadPorCredencial = credencialesDisponibles[0].recurso.capacidad;
    const totalCredenciales = credencialesDisponibles.length;
    const capacidadTotal = totalCredenciales * capacidadPorCredencial;

    // 3. Verificar disponibilidad total
    if (cantidadRequerida > capacidadTotal) {
      throw new ConflictException(
        `No hay suficientes accesos disponibles (${capacidadTotal} disponibles)`,
      );
    }

    // 4. Verificar solapamiento de horarios y uso de credenciales
    const [inicioH, inicioM] = inicio.split(':').map(Number);
    const [finH, finM] = fin.split(':').map(Number);

    let credencialesOcupadas = new Set<string>();

    reservasExistente.forEach((reserva) => {
      const [resInicioH, resInicioM] = reserva.inicio.split(':').map(Number);
      const [resFinH, resFinM] = reserva.fin.split(':').map(Number);

      // Verificar solapamiento de horarios
      if (
        !(
          finH < resInicioH ||
          (finH === resInicioH && finM <= resInicioM) ||
          (inicioH > resFinH || (inicioH === resFinH && inicioM >= resFinM))
        )
      ) {
        // Hay solapamiento, agregar las credenciales usadas al conjunto
        reserva.detalle_reserva.forEach(detalle => {
          credencialesOcupadas.add(detalle.id);
        });
      }
    });

    // 5. Calcular credenciales disponibles
    const credencialesDisponiblesCount = totalCredenciales - credencialesOcupadas.size;
    const credencialesNecesarias = Math.ceil(cantidadRequerida / capacidadPorCredencial);

    if (credencialesDisponiblesCount < credencialesNecesarias) {
      const accesosDisponibles = credencialesDisponiblesCount * capacidadPorCredencial;
      throw new ConflictException(
        `No hay suficiente disponibilidad en el horario solicitado. ` +
          `Solo ${accesosDisponibles > 0 ? accesosDisponibles : 0} accesos disponibles en este horario`,
      );
    }
  }

  async findAll() {
    try {
      return await this.reservaRepository.find({order: {creacion: 'DESC'}});
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado');
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
