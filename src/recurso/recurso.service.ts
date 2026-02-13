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
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Credencial } from 'src/credencial/entities/credencial.entity';

interface RawRecursoResult {
  recurso_id: number;
  recurso_nombre: string;
  recurso_link_declaracion: string | null;
  recurso_creacion: Date;
  recurso_estado: number;
  recurso_capacidad: number | null;
  recurso_cantidad_credenciales: string;
  tipoRecurso_nombre: string;
  proveedor_nombre: string;
  tipoAcceso_id: number;
  tipoAcceso_nombre: string;
}

interface CountResult {
  count: string;
}

@Injectable()
export class RecursoService {
  constructor(
    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,

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
        link_guia,
        link_aula_virtual,
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
        link_guia,
        link_aula_virtual,
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
      throw new InternalServerErrorException('Error al crear recurso');
    }
  }

  async findAll(paginationRecursoDto: PaginationRecursoDto) {
    try {
      const { rol_usuario_id, sort_name, sort_state, page, limit, search } =
        paginationRecursoDto;

      // Construir query base
      const query = this.recursoRepository
        .createQueryBuilder('recurso')
        .leftJoinAndSelect('recurso.tipoRecurso', 'tipoRecurso')
        .leftJoinAndSelect('recurso.tipoAcceso', 'tipoAcceso')
        .leftJoinAndSelect('recurso.proveedor', 'proveedor')
        .leftJoin('recurso.credencial', 'credencial')
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
        .addSelect(
          'COUNT(DISTINCT credencial.id)',
          'recurso_cantidad_credenciales',
        )
        .addSelect('COUNT(*) OVER() AS total_count')
        .groupBy('recurso.id')
        .addGroupBy('tipoRecurso.id')
        .addGroupBy('tipoAcceso.id')
        .addGroupBy('proveedor.id');

      // Si hay rol_usuario_id, filtrar por usuario
      if (rol_usuario_id) {
        query
          .innerJoin('recurso.recursoCursoModalidad', 'recursoCursoModalidad')
          .innerJoin('recursoCursoModalidad.cursoModalidad', 'cursoModalidad')
          .innerJoin('cursoModalidad.clase', 'clase')
          .innerJoin('clase.responsable', 'responsable')
          .andWhere('responsable.rol_usuario_id = :rol_usuario_id', {
            rol_usuario_id,
          });
      }

      // Aplicar filtros comunes
      if (sort_state !== undefined) {
        query.andWhere('recurso.estado = :estado', {
          estado: sort_state === 1 ? 1 : 0,
        });
      }

      if (search?.trim()) {
        query.andWhere(
          '(recurso.nombre ILIKE :search OR recurso.descripcion ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Ordenamiento
      if (sort_name !== undefined) {
        query.orderBy(
          'recurso.nombre',
          sort_name === 1 ? 'ASC' : 'DESC',
        );
      } else {
        query.orderBy('recurso.creacion', 'DESC');
      }

      // Paginación
      const results = await query
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const totalCount =
        results.length > 0 ? parseInt(results[0].total_count) : 0;

      const mappedResults = results.map((raw) => ({
        id: raw.recurso_id,
        nombre: raw.recurso_nombre,
        descripcion: raw.recurso_descripcion,
        link_declaracion: raw.recurso_link_declaracion,
        creacion: raw.recurso_creacion,
        estado: raw.recurso_estado,
        capacidad: raw.recurso_capacidad,
        cantidad_credenciales:
          parseInt(raw.recurso_cantidad_credenciales, 10) || 0,
        tipoRecurso: { nombre: raw.tipoRecurso_nombre },
        proveedor: { nombre: raw.proveedor_nombre },
        tipoAcceso: {
          id: raw.tipoAcceso_id,
          nombre: raw.tipoAcceso_nombre,
        },
      }));

      return {
        results: mappedResults,
        meta: {
          count: totalCount,
          page: page,
          limit: limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener los recursos');
    }
  }
  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del recurso no puede estar vacío');

      const recurso = await this.recursoRepository.findOne({
        where: { id },
        relations: ['tipoRecurso', 'proveedor', 'tipoAcceso'],
      });
      if (!recurso) throw new NotFoundException('Recurso no encontrado');

      const credenciales = await this.credencialRepository.find({
        where: { recurso: { id } },
        relations: ['rol'],
      });

      const credencialesPorRol = credenciales.reduce((acc, credencial) => {
        const rolNombre = credencial.rol.nombre || 'NO IDENTIFICADO';
        if (!acc[rolNombre]) {
          acc[rolNombre] = 0;
        }
        acc[rolNombre]++;
        return acc;
      }, {});

      const soloCredencialesGenerales =
        Object.keys(credencialesPorRol).length === 1 &&
        ('GENERAL' in credencialesPorRol ||
          Object.keys(credencialesPorRol)[0] === 'GENERAL');

      return {
        ...recurso,
        general: soloCredencialesGenerales,
        total_credenciales: credenciales.length,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el recurso');
    }
  }

  async findOneByNombre(nombre: string) {
    if (!nombre)
      throw new BadRequestException(
        'El nombre del recurso no puede estar vacío',
      );
    return await this.recursoRepository.findOneBy({ nombre });
  }

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
      throw new InternalServerErrorException('Error al actualizar el recurso');
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
      throw new InternalServerErrorException(
        'Error al deshabilitar/habilitar el recurso',
      );
    }
  }
}
