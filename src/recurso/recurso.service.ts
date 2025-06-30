import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { UpdateRecursoDto } from './dto/update-recurso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Recurso } from './entities/recurso.entity';
import { Not, Repository } from 'typeorm';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { TipoRecurso } from 'src/tipo_recurso/entities/tipo_recurso.entity';
import { TipoAcceso } from 'src/tipo_acceso/entities/tipo_acceso.entity';
import { PaginationRecursoDto } from './dto/pagination-recurso.dto';
import { Credencial } from 'src/credencial/entities/credencial.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';

@Injectable()
export class RecursoService {
  constructor(
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(TipoRecurso)
    private readonly tipoRecursoRepository: Repository<TipoRecurso>,

    @InjectRepository(TipoAcceso)
    private readonly tipoAccesoRepository: Repository<TipoAcceso>,

    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,

    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
  ) {}

  async create(createRecursoDto: CreateRecursoDto) {
    try {
      const {
        nombre,
        descripcion,
        link_declaracion,
        tiempo_reserva,
        capacidad,
        tipo_recurso_id,
        proveedor_id,
        tipo_acceso_id,
      } = createRecursoDto;

      const [
        tipoRecursoExists,
        proveedorExists,
        tipoAccesoExists,
        nombreExists,
      ] = await Promise.all([
        this.tipoRecursoRepository.existsBy({ id: tipo_recurso_id }),
        this.proveedorRepository.existsBy({ id: proveedor_id }),
        this.tipoAccesoRepository.existsBy({ id: tipo_acceso_id }),
        this.recursoRepository.existsBy({ nombre }),
      ]);

      if (!tipoRecursoExists)
        throw new NotFoundException('No existe un tipoRecurso con ese id');
      if (!proveedorExists)
        throw new NotFoundException('No existe un proveedor con ese id');
      if (nombreExists)
        throw new ConflictException('Ya existe un recurso con ese nombre');
      if (!tipoAccesoExists)
        throw new NotFoundException('No existe un tipoAcceso con ese id');

      const recurso = this.recursoRepository.create({
        nombre,
        descripcion,
        link_declaracion,
        tiempo_reserva,
        capacidad,
        tipoRecurso: { id: tipo_recurso_id },
        tipoAcceso: { id: tipo_acceso_id },
        proveedor: { id: proveedor_id },
      });
      return await this.recursoRepository.save(recurso);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(paginationRecursoDto: PaginationRecursoDto) {
    try {
      const { rol_usuario_id, sort_name, sort_state, page, limit, search } =
        paginationRecursoDto;

      // 1. Validar que el rol_usuario_id existe si fue proporcionado
      if (rol_usuario_id) {
        const rolUsuario = await this.rolUsuarioRepository.findOne({
          where: { id: rol_usuario_id },
          relations: ['usuario', 'rol'],
        });

        if (!rolUsuario) {
          throw new BadRequestException(
            'El rol de usuario proporcionado no existe',
          );
        }
      }

      // Query para contar el total (sin paginación ni GROUP BY)
      const countQuery = this.recursoRepository.createQueryBuilder('recurso');

      // Query principal con datos, relaciones y COUNT
      const query = this.recursoRepository
        .createQueryBuilder('recurso')
        .leftJoinAndSelect('recurso.tipoRecurso', 'tipoRecurso')
        .leftJoinAndSelect('recurso.tipoAcceso', 'tipoAcceso')
        .leftJoinAndSelect('recurso.proveedor', 'proveedor')
        .leftJoin('recurso.credencial', 'credencial')
        .leftJoin('recurso.recurso_curso', 'recursoCurso')
        .select([
          'recurso.id',
          'recurso.nombre',
          'recurso.link_declaracion',
          'recurso.creacion',
          'recurso.estado',
          'recurso.capacidad',
          'tipoRecurso.nombre',
          'proveedor.nombre',
          'tipoAcceso.id',
          'tipoAcceso.nombre',
        ])
        .addSelect('COUNT(credencial.id)', 'cantidad_credenciales')
        .groupBy('recurso.id')
        .addGroupBy('tipoRecurso.nombre')
        .addGroupBy('proveedor.nombre')
        .addGroupBy('tipoAcceso.id')
        .addGroupBy('tipoAcceso.nombre');

      // Filtro por rol_usuario_id (si es docente)
      if (rol_usuario_id) {
        const rolUsuario = await this.rolUsuarioRepository.findOne({
          where: { id: rol_usuario_id },
          relations: ['rol'],
        });

        if (!rolUsuario) {
          throw new BadRequestException(
            'El rol de usuario proporcionado no existe',
          );
        }

        if (rolUsuario.rol.nombre === 'DOCENTE') {
          // Para docentes: filtrar por cursos donde son responsables
          // La relación correcta es: Recurso → RecursoCurso → Curso → CursoModalidad → Responsable
          query
            .leftJoin('recursoCurso.curso', 'curso')
            .leftJoin('curso.curso_modalidad', 'cursoModalidad')
            .leftJoin('cursoModalidad.responsable', 'responsable')
            .leftJoin('responsable.rolUsuario', 'rolUsuarioResponsable')
            .andWhere('rolUsuarioResponsable.id = :rol_usuario_id', {
              rol_usuario_id,
            });

          countQuery
            .leftJoin('recurso.recurso_curso', 'countRecursoCurso')
            .leftJoin('countRecursoCurso.curso', 'countCurso')
            .leftJoin('countCurso.curso_modalidad', 'countCursoModalidad')
            .leftJoin('countCursoModalidad.responsable', 'countResponsable')
            .leftJoin('countResponsable.rolUsuario', 'countRolUsuario')
            .andWhere('countRolUsuario.id = :rol_usuario_id', {
              rol_usuario_id,
            });
        }
        // Para administradores no aplicamos filtro adicional
      }

      // Resto de los filtros
      if (sort_state !== undefined) {
        const filter = { estado: sort_state === 1 ? 1 : 0 };
        query.andWhere('recurso.estado = :estado', filter);
        countQuery.andWhere('recurso.estado = :estado', filter);
      }

      if (search) {
        const searchFilter = { search: `%${search.toUpperCase()}%` };
        query.andWhere(
          '(UPPER(recurso.nombre) LIKE UPPER(:search) OR UPPER(recurso.descripcion) LIKE UPPER(:search))',
          searchFilter,
        );
        countQuery.andWhere(
          '(UPPER(recurso.nombre) LIKE UPPER(:search) OR UPPER(recurso.descripcion) LIKE UPPER(:search))',
          searchFilter,
        );
      }

      // Ordenamiento
      if (sort_name !== undefined) {
        query.orderBy('recurso.nombre', sort_name === 1 ? 'ASC' : 'DESC');
      } else {
        query.orderBy('recurso.creacion', 'DESC');
      }

      // Paginación y ejecución
      const [rawResults, totalCount] = await Promise.all([
        query
          .offset((page - 1) * limit)
          .limit(limit)
          .getRawMany(),
        countQuery.getCount(),
      ]);

      // Mapeo de resultados
      const results = rawResults.map((raw) => ({
        id: raw.recurso_id,
        nombre: raw.recurso_nombre,
        link_declaracion: raw.recurso_link_declaracion,
        creacion: raw.recurso_creacion,
        estado: raw.recurso_estado,
        capacidad: raw.recurso_capacidad,
        cantidad_credenciales: parseInt(raw.cantidad_credenciales, 10) || 0,
        tipoRecurso: { nombre: raw.tipoRecurso_nombre },
        proveedor: { nombre: raw.proveedor_nombre },
        tipoAcceso: {
          id: raw.tipoAcceso_id,
          nombre: raw.tipoAcceso_nombre,
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
      throw new InternalServerErrorException('Error inesperado', error);
    }
  }

  async findOne(id: string): Promise<Recurso> {
    try {
      if (!id)
        throw new BadRequestException('El ID del recurso no puede estar vacío');

      const recurso = await this.recursoRepository.findOne({
        where: { id },
        relations: ['tipoRecurso', 'proveedor', 'tipoAcceso'],
      });
      if (!recurso) throw new NotFoundException('Recurso no encontrado');
      return recurso;
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

//   async getRecursosByDocente(rol_usuario_id: string) {
//   try {
//     if (!rol_usuario_id) {
//       throw new BadRequestException('El ID del rol_usuario no puede estar vacío');
//     }

//     const rolUsuario = await this.rolUsuarioRepository.existsBy({
//       id: rol_usuario_id,
//     });
//     if (!rolUsuario) {
//       throw new NotFoundException('No existe un rol_usuario con ese id');
//     }

//     return await this.recursoRepository
//       .createQueryBuilder('recurso')
//       .innerJoin('recurso.recurso_curso', 'recursoCurso')
//       .innerJoin('recursoCurso.curso', 'curso')
//       .innerJoin('curso.curso_modalidad', 'cursoModalidad')
//       .innerJoin('cursoModalidad.responsable', 'responsable')
//       .innerJoin('responsable.rolUsuario', 'rolUsuario')
//       .where('rolUsuario.id = :rolUsuarioId', {
//         rolUsuarioId: rol_usuario_id,
//       })
//       .getMany();
//   } catch (error) {
//     if (error instanceof NotFoundException || error instanceof BadRequestException) {
//       throw error;
//     }
//     throw new InternalServerErrorException('Error al obtener los recursos del docente');
//   }
// }

  async update(id: string, updateRecursoDto: UpdateRecursoDto) {
    try {
      const {
        nombre,
        descripcion,
        link_declaracion,
        tiempo_reserva,
        capacidad,
        tipo_recurso_id,
        proveedor_id,
        tipo_acceso_id,
      } = updateRecursoDto;

      if (!id)
        throw new BadRequestException('El ID del recurso no puede estar vacío');

      const recurso = await this.recursoRepository.findOneBy({ id });
      if (!recurso) {
        throw new NotFoundException('Recurso no encontrado');
      }

      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.recursoRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException('Ya existe un recurso con ese nombre');
        }
        updateData.nombre = nombre;
      }
      if (proveedor_id !== undefined) {
        const proveedorExists = await this.proveedorRepository.existsBy({
          id: proveedor_id,
        });

        if (!proveedorExists) {
          throw new NotFoundException('No existe un proveedor con ese id');
        }
        updateData.proveedor = { id: proveedor_id };
      }

      if (tipo_recurso_id !== undefined) {
        const tipoRecursoExists = await this.tipoRecursoRepository.existsBy({
          id: tipo_recurso_id,
        });

        if (!tipoRecursoExists) {
          throw new NotFoundException('No existe un tipoRecurso con ese id');
        }
        updateData.tipoRecurso = { id: tipo_recurso_id };
      }

      if (tipo_acceso_id !== undefined) {
        const tipoAccesoExists = await this.tipoAccesoRepository.existsBy({
          id: tipo_acceso_id,
        });

        if (!tipoAccesoExists) {
          throw new NotFoundException('No existe un tipoAcceso con ese id');
        }
        updateData.tipoAcceso = { id: tipo_acceso_id };
      }

      if (descripcion !== undefined) {
        updateData.descripcion = descripcion;
      }
      // if (cantidad_credenciales !== undefined) {
      //   updateData.cantidad_credenciales = cantidad_credenciales;
      // }
      if (link_declaracion !== undefined) {
        updateData.link_declaracion = link_declaracion;
      }
      if (tiempo_reserva !== undefined) {
        updateData.tiempo_reserva = tiempo_reserva;
      }
      if (capacidad !== undefined) {
        updateData.capacidad = capacidad;
      }

      if (Object.keys(updateData).length === 0) {
        return recurso;
      }

      await this.recursoRepository.update(id, updateData);

      return await this.recursoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del recurso no puede estar vacío');

      const result = await this.recursoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Recurso no encontrado');
      return this.recursoRepository.findOneBy({ id });
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
