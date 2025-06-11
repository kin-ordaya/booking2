import { PaginationRolUsuarioDto } from './dto/rol_usuario-pagination.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRolUsuarioDto } from './dto/create-rol_usuario.dto';
import { UpdateRolUsuarioDto } from './dto/update-rol_usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolUsuario } from './entities/rol_usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class RolUsuarioService {
  constructor(
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRolUsuarioDto: CreateRolUsuarioDto) {
    try {
      const { usuario_id, rol_id } = createRolUsuarioDto;

      const [usuarioExists, rolExists] = await Promise.all([
        this.usuarioRepository.existsBy({ id: usuario_id }),
        this.rolRepository.existsBy({ id: rol_id }),
      ]);

      if (!usuarioExists)
        throw new NotFoundException('No existe un usuario con ese id');
      if (!rolExists)
        throw new NotFoundException('No existe un rol con ese id');

      const rolUsuarioExists = await this.rolUsuarioRepository.existsBy({
        usuario: { id: usuario_id },
        rol: { id: rol_id },
      });

      if (rolUsuarioExists)
        throw new NotFoundException(
          'Ya existe una asignacion de rol a usuario',
        );

      const rolUsuario = this.rolUsuarioRepository.create({
        usuario: { id: usuario_id },
        rol: { id: rol_id },
      });
      return await this.rolUsuarioRepository.save(rolUsuario);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(paginationRolUsuarioDto: PaginationRolUsuarioDto) {
    try {
      const {
        page = 1,
        limit = 10,
        sort_name,
        sort_state,
        rol_id,
      } = paginationRolUsuarioDto;

      const query = this.rolUsuarioRepository
        .createQueryBuilder('rolUsuario')
        .leftJoinAndSelect('rolUsuario.usuario', 'usuario')
        .leftJoinAndSelect('rolUsuario.rol', 'rol')
        .select([
          'rolUsuario.id',
          'rolUsuario.asignacion',
          'usuario.id',
          'usuario.nombres',
          'usuario.apellidos',
          'usuario.numero_documento',
          'rol.id',
          'rol.nombre',
        ]);

      // Ordenamiento
      if (sort_name) {
        query.orderBy('usuario.apellidos', sort_name === 1 ? 'ASC' : 'DESC');
      } else {
        query.orderBy('rolUsuario.asignacion', 'DESC'); // Asumiendo que existe este campo
      }

      // Filtros
      if (sort_state !== undefined) {
        query.andWhere('rolUsuario.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
      }

      if (rol_id) {
        const rolExists = await this.rolRepository.findOneBy({ id: rol_id });
        if (!rolExists) {
          throw new NotFoundException('No existe un rol con ese id');
        }
        query.andWhere('rol.id = :rol_id', { rol_id });
      }

      const [results, count] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        results,
        meta: {
          count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'Error inesperado',
      );
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del rolUsuario no puede estar vacío',
        );
      const rolUsuario = await this.rolUsuarioRepository.findOne({
        where: { id },
        relations: ['usuario', 'rol'],
      });
      if (!rolUsuario) throw new NotFoundException('RolUsuario no encontrado');
      return rolUsuario;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateRolUsuarioDto: UpdateRolUsuarioDto) {
    try {
      const { rol_id } = updateRolUsuarioDto;

      if (!id) {
        throw new BadRequestException(
          'El ID del rolUsuario no puede estar vacío',
        );
      }
      const rolUsuario = await this.rolUsuarioRepository.findOneBy({ id });
      if (!rolUsuario) {
        throw new NotFoundException('RolUsuario no encontrado');
      }

      const rolExists = await this.rolRepository.existsBy({ id: rol_id });
      if (!rolExists) {
        throw new NotFoundException('No existe un rol con ese id');
      }

      const rolUsuarioExists = await this.rolUsuarioRepository.existsBy({
        usuario: { id: rolUsuario.usuario.id },
        rol: { id: rol_id },
      });
      if (rolUsuarioExists) {
        throw new ConflictException(
          'Ya existe una asignación de este rol a este usuario',
        );
      }

      await this.rolUsuarioRepository.update(id, {
        rol: { id: rol_id },
      });

      return await this.rolUsuarioRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del rolUsuario no puede estar vacío',
        );
      const result = await this.rolUsuarioRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();
      if (result.affected === 0)
        throw new NotFoundException('RolUsuario no encontrado');
      return this.rolUsuarioRepository.findOneBy({ id });
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
