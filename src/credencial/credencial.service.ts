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

@Injectable()
export class CredencialService {
  constructor(
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

      const [recursoExists, rolExists] = await Promise.all([
        this.recursoRepository.findOne({
          where: { id: recurso_id },
          relations: ['tipoAcceso'],
        }),
        this.rolRepository.existsBy({ id: rol_id }),
      ]);

      if (!recursoExists)
        throw new NotFoundException('No existe un recurso con ese id');
      if (!rolExists)
        throw new NotFoundException('No existe un rol con ese id');

      const tipoAcceso = recursoExists.tipoAcceso.nombre;

      // Validación según tipo de acceso
      if (tipoAcceso === 'USERPASS') {
        if (!usuario || !clave) {
          throw new BadRequestException(
            'Para recursos de tipo USERPASS, debe ingresar usuario y clave',
          );
        }
      } else if (tipoAcceso === 'KEY') {
        if (!clave) {
          throw new BadRequestException(
            'Para recursos de tipo KEY, debe ingresar la clave',
          );
        }
      } else {
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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(paginationCredencialDto: PaginationCredencialDto) {
    try {
      const { page, limit, search, recurso_id, sort_state, rol_id } =
        paginationCredencialDto;

      const recursoExists = await this.recursoRepository.existsBy({
        id: recurso_id,
      });
      if (!recursoExists)
        throw new NotFoundException('No existe un recurso con ese id');

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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID de la credencial no puede estar vacío',
        );

      const credencial = await this.credencialRepository.findOne({
        where: { id },
        relations: ['rol'],
      });
      if (!credencial) throw new NotFoundException('Credencial no encontrada');
      return credencial;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateCredencialDto: UpdateCredencialDto) {
    try {
      const { usuario, clave, rol_id } = updateCredencialDto;

      if (!id) {
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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
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

      if (result.affected === 0)
        throw new NotFoundException('Credencial no encontrada');
      return this.credencialRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
