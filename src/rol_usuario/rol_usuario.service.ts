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
import { Not, Repository } from 'typeorm';
import { RolUsuario } from './entities/rol_usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';

@Injectable()
export class RolUsuarioService {
  constructor(
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
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
      throw new InternalServerErrorException(
        'Error al crear asignación de rol a usuario',
      );
    }
  }

  async findAll(paginationRolUsuarioDto: PaginationRolUsuarioDto) {
    try {
      const { page, limit, search, sort_name, sort_state, rol_id } =
        paginationRolUsuarioDto;

      const query = this.rolUsuarioRepository
        .createQueryBuilder('rolUsuario')
        .leftJoin('rolUsuario.usuario', 'usuario')
        .leftJoin('rolUsuario.rol', 'rol')
        .select([
          'rolUsuario.id',
          'rolUsuario.asignacion',
          'rolUsuario.estado',
          'usuario.id',
          'usuario.estado',
          'usuario.nombres',
          'usuario.apellidos',
          'usuario.correo_institucional',
          'rol.id',
          'rol.nombre',
        ])
        .addSelect('COUNT(*) OVER()', 'total_count');

      if (sort_name !== undefined) {
        query.orderBy('usuario.apellidos', sort_name === 1 ? 'ASC' : 'DESC');
      } else {
        query.orderBy('rolUsuario.asignacion', 'DESC');
      }

      if (sort_state !== undefined) {
        query.andWhere('rolUsuario.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
      }

      if (rol_id !== undefined) {
        query.andWhere('rol.id = :rol_id', { rol_id });
      }

      if (search && search.trim() !== '') {
        query.where(
          'UPPER(usuario.nombres) LIKE UPPER(:search) OR UPPER(usuario.apellidos) LIKE UPPER(:search) OR UPPER(usuario.correo_institucional) LIKE UPPER(:search)',
          { search: `%${search}%` },
        );
      }

      const results = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const totalCount =
        results.length > 0 ? parseInt(results[0].total_count) : 0;

      const formattedResults = results.map((row) => ({
        id: row.rolUsuario_id,
        asignacion: row.rolUsuario_asignacion,
        estado: row.rolUsuario_estado,
        usuario: {
          id: row.usuario_id,
          estado: row.usuario_estado,
          nombres: row.usuario_nombres,
          apellidos: row.usuario_apellidos,
          correo_institucional: row.usuario_correo_institucional,
        },
        rol: {
          id: row.rol_id,
          nombre: row.rol_nombre,
        },
      }));

      return {
        results: formattedResults,
        meta: {
          count: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las asignaciones de rol a usuario',
      );
    }
  }

  async getDocentesByRecurso(recurso_id: string) {
    try {
      if (!recurso_id) {
        throw new BadRequestException('El ID del recurso no puede estar vacío');
      }

      const recursoExists = await this.recursoRepository.existsBy({
        id: recurso_id,
      });
      if (!recursoExists) {
        throw new NotFoundException('No existe un recurso con ese id');
      }

      return await this.rolUsuarioRepository
        .createQueryBuilder('rolUsuario')
        .innerJoin('rolUsuario.responsable', 'responsable')
        .innerJoin('responsable.clase', 'clase')
        .innerJoin('clase.cursoModalidad', 'cursoModalidad')
        .innerJoin(
          'cursoModalidad.recursoCursoModalidad',
          'recursoCursoModalidad',
        )
        .innerJoin('recursoCursoModalidad.recurso', 'recurso')
        .innerJoin('rolUsuario.rol', 'rol')
        .innerJoin('rolUsuario.usuario', 'usuario')
        .select([
          'rolUsuario.id',
          'usuario.nombres',
          'usuario.apellidos',
          'usuario.correo_institucional',
        ])
        .where('recurso.id = :recursoId', { recursoId: recurso_id })
        .andWhere('rol.nombre = :rolNombre', { rolNombre: 'DOCENTE' })
        .andWhere('usuario.estado = :estado', { estado: 1 })
        .getMany();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener los docentes del recurso',
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
      throw new InternalServerErrorException('Error al obtener el rolUsuario');
    }
  }

  async findOneByRecurso(id: string) {
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
      throw new InternalServerErrorException('Error al obtener el rolUsuario');
    }
  }

  async findOneByUsuarioRol(usuario_id: string, rol_id: string) {
    try {
      if (!usuario_id || !rol_id)
        throw new BadRequestException(
          'El ID del rolUsuario no puede estar vacío',
        );
      return await this.rolUsuarioRepository.findOne({
        where: {
          usuario: { id: usuario_id },
          rol: { id: rol_id },
        },
        relations: ['usuario', 'rol'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Error al obtener el rolUsuario por usuario y rol',
      );
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
        id: Not(id),
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
      throw new InternalServerErrorException(
        'Error al actualizar el rolUsuario',
      );
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
      throw new InternalServerErrorException(
        'Error al deshabilitar/habilitar usuario',
      );
    }
  }
}
