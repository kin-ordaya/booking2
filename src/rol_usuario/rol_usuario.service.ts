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
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(paginationRolUsuarioDto: PaginationRolUsuarioDto) {
    try {
      const { page, limit, search, sort_name, sort_state, rol_id } =
        paginationRolUsuarioDto;

      const query = this.rolUsuarioRepository
        .createQueryBuilder('rolUsuario')
        .leftJoinAndSelect('rolUsuario.usuario', 'usuario')
        .leftJoinAndSelect('rolUsuario.rol', 'rol')
        .select([
          'rolUsuario.id',
          'rolUsuario.asignacion',
          'rolUsuario.estado',
          'usuario.id',
          'usuario.estado',
          'usuario.nombres',
          'usuario.apellidos',
          'usuario.numero_documento',
          'usuario.correo_institucional',
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

      if (search) {
        query.where(
          'UPPER(usuario.nombres) LIKE UPPER(:search) OR UPPER(usuario.apellidos) LIKE UPPER(:search) OR UPPER(usuario.numero_documento) LIKE UPPER(:search) OR UPPER(usuario.correo_institucional) LIKE UPPER(:search)',
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
        .innerJoin('responsable.clase', 'clase') // Cambio clave: ahora se une con clase directamente
        .innerJoin('clase.cursoModalidad', 'cursoModalidad') // Luego a cursoModalidad desde clase
        .innerJoin('cursoModalidad.curso', 'curso')
        .innerJoin('curso.recurso_curso', 'recursoCurso')
        .innerJoin('recursoCurso.recurso', 'recurso')
        .innerJoin('rolUsuario.rol', 'rol')
        .innerJoin('rolUsuario.usuario', 'usuario') // Agregado para obtener datos del usuario
        .innerJoin('usuario.documento_identidad', 'documentoIdentidad')
        .select([
          'rolUsuario.id',
          // 'rolUsuario.asignacion',
          // 'rolUsuario.estado',
          // 'rol.nombre', // Nombre del rol
          'usuario.nombres', // Nombres del usuario
          'usuario.apellidos',
          'usuario.numero_documento',
          'usuario.correo_institucional',
          'documentoIdentidad.id',
          'documentoIdentidad.nombre',
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
      throw new InternalServerErrorException('Error inesperado');
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
