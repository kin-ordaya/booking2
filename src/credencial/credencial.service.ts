import { PaginationCredencialDto } from './dto/pagination-credencial.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredencialDto } from './dto/create-credencial.dto';
import { UpdateCredencialDto } from './dto/update-credencial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credencial } from './entities/credencial.entity';
import { Repository } from 'typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class CredencialService {
  constructor(
    @InjectPinoLogger(CredencialService.name)
    private readonly logger: PinoLogger,

    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createCredencialDto: CreateCredencialDto) {
    try {
      const { usuario, clave, recurso_id, rol_id } = createCredencialDto;
      this.logger.info(
        {
          operation: 'create_started',
          entity: 'credencial',
        },
        'Iniciando creación de credencial',
      );

      const [recursoExists, rolExists] = await Promise.all([
        this.recursoRepository.findOne({
          where: { id: recurso_id },
          relations: ['tipoAcceso'],
        }),
        this.rolRepository.existsBy({ id: rol_id }),
      ]);

      if (!recursoExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'credencial',
            reason: 'recurso_not_found',
            recursoId: recurso_id || 'unknown',
          },
          'No existe un recurso con ese id',
        );

        throw new NotFoundException('No existe un recurso con ese id');
      }

      if (!rolExists) {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'credencial',
            reason: 'rol_not_found',
            rolId: rol_id || 'unknown',
          },
          'No existe un rol con ese id',
        );

        throw new NotFoundException('No existe un rol con ese id');
      }

      const tipoAcceso = recursoExists.tipoAcceso.nombre;

      // Validación según tipo de acceso
      if (tipoAcceso === 'USERPASS') {
        if (!usuario || !clave) {
          this.logger.error(
            {
              operation: 'create_failed',
              entity: 'credencial',
              reason: 'usuario_clave_empty',
              usuario,
              clave,
            },
            'Para recursos de tipo USERPASS, debe ingresar usuario y clave',
          );

          throw new BadRequestException(
            'Para recursos de tipo USERPASS, debe ingresar usuario y clave',
          );
        }
      } else if (tipoAcceso === 'KEY') {
        if (!clave) {
          this.logger.error(
            {
              operation: 'create_failed',
              entity: 'credencial',
              reason: 'clave_empty',
              clave,
            },
            'Para recursos de tipo KEY, debe ingresar la clave',
          );

          throw new BadRequestException(
            'Para recursos de tipo KEY, debe ingresar la clave',
          );
        }
      } else {
        this.logger.error(
          {
            operation: 'create_failed',
            entity: 'credencial',
            reason: 'tipo_acceso_invalido',
            tipoAcceso,
          },
          'Tipo de acceso no válido',
        );

        throw new BadRequestException('Tipo de acceso no válido');
      }

      // Construcción dinámica del objeto
      const credencialData: any = {
        clave,
        recurso: { id: recurso_id },
        rol: { id: rol_id },
      };

      // Solo agregamos 'usuario' si es USERPASS
      if (tipoAcceso === 'USERPASS') {
        credencialData.usuario = usuario;
      }

      const credencial = this.credencialRepository.create(credencialData);
      return await this.credencialRepository.save(credencial);
    } catch (error) {
      this.logger.error(
        {
          operation: 'create_error',
          entity: 'credencial',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de creación de credencial',
      );
      throw error;
    }
  }

  async findAll(paginationCredencialDto: PaginationCredencialDto) {
    try {
      const { page, limit, search, recurso_id, sort_state, rol_id } =
        paginationCredencialDto;

      this.logger.info(
        {
          operation: 'find_all_started',
          entity: 'credencial',
        },
        'Iniciando búsqueda de credencials',
      );

      const recursoExists = await this.recursoRepository.existsBy({
        id: recurso_id,
      });

      if (!recursoExists) {
        this.logger.error(
          {
            operation: 'find_all_failed',
            entity: 'credencial',
            reason: 'recurso_not_found',
            recursoId: recurso_id || 'unknown',
          },
          'No existe un recurso con ese id',
        );

        throw new NotFoundException('No existe un recurso con ese id');
      }

      const query = this.credencialRepository
        .createQueryBuilder('credencial')
        .leftJoinAndSelect('credencial.recurso', 'recurso')
        .leftJoinAndSelect('credencial.rol', 'rol')
        .select([
          'credencial.id',
          'credencial.usuario',
          'credencial.creacion',
          'credencial.clave',
          'credencial.estado',
          'recurso.nombre',
          'recurso.capacidad',
          'rol.nombre',
        ])
        .where('credencial.recurso.id = :recurso_id', { recurso_id });

      let orderApplied = false;
      if (sort_state !== undefined) {
        query.andWhere('credencial.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
        orderApplied = true;
      }

      if (!orderApplied) {
        query.orderBy('credencial.creacion', 'DESC');
      }

      if (rol_id !== undefined) {
        query.andWhere('rol.id = :rol_id', {
          rol_id,
        });
      }

      if (search) {
        // Cambiar .where() por .andWhere() aquí
        query.andWhere(
          '(UPPER(credencial.usuario) LIKE UPPER(:search) OR UPPER(credencial.clave) LIKE UPPER(:search))',
          { search: `%${search}%` },
        );
      }

      const [results, count] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      this.logger.info(
        {
          operation: 'find_all_success',
          entity: 'credencial',
        },
        'Credencials encontradas exitosamente',
      );

      return {
        results,
        meta: {
          count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_all_error',
          entity: 'credencial',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de credencials',
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      this.logger.info(
        {
          operation: 'find_one_started',
          entity: 'credencial',
          credencialId: id || 'unknown',
        },
        'Iniciando búsqueda de credencial',
      );
      if (!id) {
        this.logger.error(
          {
            operation: 'find_one_failed',
            entity: 'credencial',
            reason: 'credencial_id_empty',
            credencialId: id || 'unknown',
          },
          'El ID de la credencial no puede estar vacío',
        );

        throw new BadRequestException(
          'El ID de la credencial no puede estar vacío',
        );
      }

      const credencial = await this.credencialRepository.findOne({
        where: { id },
        relations: ['rol'],
      });
      if (!credencial) throw new NotFoundException('Credencial no encontrada');
      return credencial;
    } catch (error) {
      this.logger.error(
        {
          operation: 'find_one_error',
          entity: 'credencial',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de búsqueda de credencial',
      );
      throw error;
    }
  }

  async update(id: string, updateCredencialDto: UpdateCredencialDto) {
    try {
      const { usuario, clave, rol_id } = updateCredencialDto;

      this.logger.info(
        {
          operation: 'update_started',
          entity: 'credencial',
          credencialId: id || 'unknown',
        },
        'Iniciando actualización de credencial',
      );

      if (!id) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'credencial',
            reason: 'credencial_id_empty',
            credencialId: id || 'unknown',
          },
          'El ID de la credencial no puede estar vacío',
        );

        throw new BadRequestException(
          'El ID de la credencial no puede estar vacío',
        );
      }

      // Obtener la credencial con relaciones necesarias
      const credencial = await this.credencialRepository.findOne({
        where: { id },
        relations: ['recurso', 'recurso.tipoAcceso'],
      });

      if (!credencial) {
        this.logger.error(
          {
            operation: 'update_failed',
            entity: 'credencial',
            reason: 'credencial_not_found',
            credencialId: id || 'unknown',
          },
          'Credencial no encontrada',
        );

        throw new NotFoundException('Credencial no encontrada');
      }

      const tipoAcceso = credencial.recurso.tipoAcceso.nombre;

      if (tipoAcceso === 'KEY') {
        if (usuario !== undefined) {
          delete updateCredencialDto.usuario;
        }
      }

      // Preparar datos para actualizar
      const updateData: any = {};

      if (usuario !== undefined && tipoAcceso === 'USERPASS') {
        updateData.usuario = usuario;
      }

      if (clave !== undefined) {
        updateData.clave = clave;
      }

      if (rol_id !== undefined) {
        const rolExists = await this.rolRepository.existsBy({
          id: rol_id,
        });

        if (!rolExists) {
          this.logger.error(
            {
              operation: 'update_failed',
              entity: 'credencial',
              reason: 'rol_not_found',
              rolId: rol_id || 'unknown',
            },
            'No existe un rol con ese id',
          );

          throw new NotFoundException('No existe un rol con ese id');
        }

        updateData.rol = { id: rol_id };
      }

      // Si no hay cambios, retornar la credencial actual
      if (Object.keys(updateData).length === 0) {
        return credencial;
      }

      // Aplicar actualización
      await this.credencialRepository.update(id, updateData);
      return await this.credencialRepository.findOne({
        where: { id },
        relations: ['recurso', 'rol'],
      });
    } catch (error) {
      this.logger.error(
        {
          operation: 'update_error',
          entity: 'credencial',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de actualización de credencial',
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      this.logger.info({
        operation: 'remove_started',
        entity: 'credencial',
        credencialId: id || 'unknown',
      })

      if (!id)
        throw new BadRequestException(
          'El ID de la credencial no puede estar vacío',
        );

      const result = await this.credencialRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0){
        this.logger.info(
          {
            operation: 'remove_failed',
            entity: 'credencial',
            reason: 'credencial_not_found',
            credencialId: id || 'unknown',
          },
          `Credencial con id ${id} no encontrado`,
        );
        throw new NotFoundException('Credencial no encontrada');
      }

      this.logger.info(
        {
          operation: 'remove_success',
          entity: 'credencial',
          credencialId: id || 'unknown',
        },
        'Credencial eliminada exitosamente',
      );

      return this.credencialRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(
        {
          operation: 'remove_error',
          entity: 'credencial',
          error: error.message || error || 'unknown',
        },
        'Error en proceso de eliminación de credencial',
      );
      throw error;
    }
  }
}
