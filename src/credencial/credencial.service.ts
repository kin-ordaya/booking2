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

  async create(createCredencialDto: CreateCredencialDto): Promise<Credencial> {
    try {
      const { usuario, clave, recurso_id, rol_id } = createCredencialDto;

      const [recursoExists, rolExists] = await Promise.all([
        this.recursoRepository.findOne({
          where: { id: recurso_id },
          relations: ['tipoAcceso'],
        }),
        this.rolRepository.existsBy({ id: rol_id }),
      ]);

      if (!recursoExists) {
        throw new NotFoundException('No existe recurso con ID ' + recurso_id);
      }

      if (!rolExists) {
        throw new NotFoundException('No existe rol con ID ' + rol_id);
      }

      const tipoAcceso = recursoExists.tipoAcceso.nombre;

      let credencialExists;

      // Validación según tipo de acceso
      if (tipoAcceso === 'USERPASS') {
        credencialExists = await this.credencialRepository.existsBy({
          usuario,
          clave,
          recurso: { id: recurso_id },
        });

        if (credencialExists) {
          throw new ConflictException(
            'Ya existe una credencial con usuario ' +
              usuario +
              ' y clave ' +
              clave +
              ' en el recurso ' +
              recurso_id,
          );
        }
      } else if (tipoAcceso === 'KEY') {
        credencialExists = await this.credencialRepository.existsBy({
          clave,
          recurso: { id: recurso_id },
        });

        if (credencialExists) {
          throw new ConflictException(
            'Ya existe una credencial con clave ' +
              clave +
              ' en el recurso ' +
              recurso_id,
          );
        }
      } else {
        throw new BadRequestException('Tipo de acceso no válido ' + tipoAcceso);
      }

      const credencial = this.credencialRepository.create({
        usuario,
        clave,
        recurso: { id: recurso_id },
        rol: { id: rol_id },
      });

      return await this.credencialRepository.save(credencial);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear credencial');
    }
  }

  async findAll(paginationCredencialDto: PaginationCredencialDto) {
    try {
      const { page, limit, search, recurso_id, sort_state, rol_id } =
        paginationCredencialDto;

      const query = this.credencialRepository
        .createQueryBuilder('credencial')
        .leftJoin('credencial.recurso', 'recurso')
        .leftJoin('credencial.rol', 'rol')
        .select([
          'credencial.id',
          'credencial.usuario',
          'credencial.clave',
          'credencial.estado',
          'recurso.nombre',
          'recurso.capacidad',
          'rol.nombre',
        ])
        .addSelect('COUNT(*) OVER()', 'total_count')
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

      if (search !== undefined && search.trim() !== '') {
        query.andWhere(
          '(UPPER(credencial.usuario) LIKE UPPER(:search) OR UPPER(credencial.clave) LIKE UPPER(:search))',
          { search: `%${search}%` },
        );
      }

      const results = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const total_count =
        results.length > 0 ? parseInt(results[0].total_count, 10) : 0;

      const formattedResults = results.map((row) => ({
        id: row.credencial_id,
        estado: row.credencial_estado,
        usuario: row.credencial_usuario,
        clave: row.credencial_clave,
        recurso: {
          nombre: row.recurso_nombre,
          capacidad: row.recurso_capacidad,
        },
        rol: {
          nombre: row.rol_nombre,
        },
      }));

      return {
        results: formattedResults,
        meta: {
          count: total_count,
          page,
          limit,
          totalPages: Math.ceil(total_count / limit),
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar credenciales');
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de la credencial vacío');
      }

      const credencial = await this.credencialRepository.findOne({
        where: { id },
        relations: ['recurso', 'rol'],
      });

      if (!credencial) {
        throw new NotFoundException(`Credencial con id ${id} no encontrada`);
      }

      return credencial;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al recuperar credencial');
    }
  }

  async update(id: string, updateCredencialDto: UpdateCredencialDto) {
    try {
      if (!id) {
        throw new BadRequestException('ID de la credencial vacío');
      }

      const { usuario, clave, rol_id } = updateCredencialDto;

      const credencial = await this.credencialRepository.findOne({
        where: { id },
        relations: ['recurso', 'rol'],
      });

      if (!credencial) {
        throw new NotFoundException('Credencial no encontrada ' + id);
      }

      const tipoAcceso = credencial.recurso.tipoAcceso.nombre;

      if (tipoAcceso === 'KEY') {
        if (usuario !== undefined) {
          delete updateCredencialDto.usuario;
        }
      }

      const updateData: any = {};

      if (usuario !== undefined && tipoAcceso === 'USERPASS') {
        updateData.usuario = usuario;
      }

      if (clave !== undefined && clave !== credencial.clave) {
        updateData.clave = clave;
      }

      if (rol_id !== undefined && rol_id !== credencial.rol.id) {
        const rolExists = await this.rolRepository.existsBy({
          id: rol_id,
        });

        if (!rolExists) {
          throw new NotFoundException('No existe un rol con ese id ' + rol_id);
        }

        updateData.rol = { id: rol_id };
      }

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
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar credencial');
    }
  }

  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException(
          'El ID de la credencial no puede estar vacío',
        );
      }

      const credencialExists = await this.credencialRepository.existsBy({ id });

      if (!credencialExists) {
        throw new NotFoundException(`Credencial con id ${id} no encontrada`);
      }

      const result = await this.credencialRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException('Credencial no encontrada');
      }

      return this.credencialRepository.findOne({
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
      throw new InternalServerErrorException(
        'Error al deshabilitar/habilitar credencial',
      );
    }
  }
}
