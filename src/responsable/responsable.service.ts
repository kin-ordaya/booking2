import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Responsable } from './entities/responsable.entity';
import { Repository } from 'typeorm';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { Campus } from 'src/campus/entities/campus.entity';

@Injectable()
export class ResponsableService {
  constructor(
    @InjectRepository(Responsable)
    private readonly responsableRepository: Repository<Responsable>,

    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(CursoModalidad)
    private readonly cursoModalidadRepository: Repository<CursoModalidad>,

    @InjectRepository(Clase)
    private readonly claseRepository: Repository<Clase>,

    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
  ) {}

  //TODO: Analizar la asignacion
  async create(createResponsableDto: CreateResponsableDto) {
    try {
      const {
        rol_usuario_id,
        recurso_id,
        clase_id,
        curso_modalidad_id,
        campus_id,
      } = createResponsableDto;

      // 1. Validar que solo se envíe un campo opcional
      const optionalFields = [
        recurso_id,
        clase_id,
        curso_modalidad_id,
        campus_id,
      ].filter(Boolean);

      if (optionalFields.length !== 1) {
        throw new BadRequestException(
          'Debe proporcionarse exactamente uno de los siguientes campos: recurso_id, clase_id, curso_modalidad_id o campus_id',
        );
      }

      const rolUsuario = await this.rolUsuarioRepository.findOne({
        where: { id: rol_usuario_id },
        relations: ['rol'],
      });

      if (!rolUsuario) {
        throw new NotFoundException('No existe un rolUsuario con ese id');
      }

      const rolID = rolUsuario.rol.id;
      const rolNombre = rolUsuario.rol.nombre;

      // Definir qué roles pueden asignar cada recurso
      const permisosPorRol = {
        //ADMIN
        'cd206eee-6ee5-47f0-868f-5dac3e774a99': ['recurso'],
        //DOCENTE
        '17f5c3db-62eb-49d4-ab62-181a45bb6ab6': [
          'clase',
          'cursoModalidad',
          'campus',
          'recurso',
        ],
        //ESTUDIANTE
        '25e91d33-bbdd-4995-a81c-53397423708f': [],
        // GENERAL
        '555c3522-50ba-424d-bbde-5b7e29b872b7': ['recurso', 'campus'],
      };

      // 2. Definir tipo e ID del recurso opcional
      let resourceType: string;
      let resourceId: string;
      const checks: Promise<boolean>[] = []; // <- Tipo explícito para el array

      if (recurso_id) {
        checks.push(this.recursoRepository.existsBy({ id: recurso_id }));
        if (!permisosPorRol[rolID]?.includes('recurso')) {
          throw new ForbiddenException(
            `El rol ${rolNombre} no tiene permiso para recurso`,
          );
        }
        resourceType = 'recurso';
        resourceId = recurso_id;
      } else if (clase_id) {
        checks.push(this.claseRepository.existsBy({ id: clase_id }));
        if (!permisosPorRol[rolID]?.includes('clase')) {
          throw new ForbiddenException(
            `El rol ${rolNombre} no tiene permiso para clase`,
          );
        }
        resourceType = 'clase';
        resourceId = clase_id;
      } else if (curso_modalidad_id) {
        checks.push(
          this.cursoModalidadRepository.existsBy({ id: curso_modalidad_id }),
        );
        if (!permisosPorRol[rolID]?.includes('cursoModalidad')) {
          throw new ForbiddenException(
            `El rol ${rolNombre} no tiene permiso para cursoModalidad`,
          );
        }
        resourceType = 'cursoModalidad';
        resourceId = curso_modalidad_id;
      } else if (campus_id) {
        checks.push(this.campusRepository.existsBy({ id: campus_id }));
        if (!permisosPorRol[rolID]?.includes('campus')) {
          throw new ForbiddenException(
            `El rol ${rolNombre} no tiene permiso para campus`,
          );
        }
        resourceType = 'campus';
        resourceId = campus_id;
      } else {
        // Esto nunca debería ocurrir gracias a la validación anterior
        throw new BadRequestException(
          'No se proporcionó ningún recurso opcional válido',
        );
      }

      // 3. Verificar rol_usuario_id (siempre obligatorio)
      checks.push(this.rolUsuarioRepository.existsBy({ id: rol_usuario_id }));

      // 4. Ejecutar verificaciones
      const [resourceExists, rolUsuarioExists] = await Promise.all(checks);

      if (!rolUsuarioExists) {
        throw new NotFoundException('No existe un rolUsuario con ese id');
      }

      if (!resourceExists) {
        throw new NotFoundException(
          `No existe un ${resourceType} con el id ${resourceId}`,
        );
      }

      // 5. Verificar si ya existe una relación similar
      const whereClause = {
        rolUsuario: { id: rol_usuario_id },
      };

      // Agregar el recurso específico al whereClause
      if (recurso_id) {
        whereClause['recurso'] = { id: recurso_id };
      } else if (clase_id) {
        whereClause['clase'] = { id: clase_id };
      } else if (curso_modalidad_id) {
        whereClause['cursoModalidad'] = { id: curso_modalidad_id };
      } else if (campus_id) {
        whereClause['campus'] = { id: campus_id };
      }

      const existingResponsable = await this.responsableRepository.findOne({
        where: whereClause,
      });

      if (existingResponsable) {
        throw new BadRequestException(
          'Ya existe un responsable con esta combinación de rol y recurso',
        );
      }

      // 6. Crear y guardar
      const responsable = this.responsableRepository.create({
        rolUsuario: { id: rol_usuario_id },
        ...(recurso_id && { recurso: { id: recurso_id } }),
        ...(clase_id && { clase: { id: clase_id } }),
        ...(curso_modalidad_id && {
          cursoModalidad: { id: curso_modalidad_id },
        }),
        ...(campus_id && { campus: { id: campus_id } }),
      });

      return await this.responsableRepository.save(responsable);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'Error inesperado',
      );
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page, limit, search } = paginationDto;

      // Paso 1: Obtener usuarios paginados
      const query = this.responsableRepository
        .createQueryBuilder('responsable')
        .leftJoinAndSelect('responsable.rolUsuario', 'rolUsuario')
        .leftJoinAndSelect('rolUsuario.usuario', 'usuario')
        .leftJoinAndSelect('rolUsuario.rol', 'rol')
        .select([
          'responsable.id',
          'responsable.estado',
          'usuario.id',
          'usuario.estado',
          'usuario.nombres',
          'usuario.apellidos',
          'usuario.numero_documento',
          'usuario.correo_institucional',
          'rolUsuario.id',
          'rolUsuario.asignacion',
          'rolUsuario.estado',
          'rol.id',
          'rol.nombre',
        ]);

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
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Id invalido');
      }
      const responsable = await this.responsableRepository.findOne({
        where: { id },
        relations: ['rolUsuario', 'recurso', 'clase', 'cursoModalidad', 'campus'],
      });
      if (!responsable) {
        throw new NotFoundException('Responsable not found');
      }
      return responsable;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
    }
  }

  // async update(id: string, updateResponsableDto: UpdateResponsableDto) {
  //   try {
  //     const {
  //       rol_usuario_id,
  //       recurso_id,
  //       clase_id,
  //       curso_modalidad_id,
  //       campus_id,
  //     } = updateResponsableDto;

  //     if (!id) {
  //       throw new BadRequestException('Id invalido');
  //     }
  //     const responsable = await this.responsableRepository.findOne({
  //       where: { id },
  //     });
  //     if (!responsable) {
  //       throw new NotFoundException('Responsable not found');
  //     }
      

  //   } catch (error) {
  //     if (
  //       error instanceof BadRequestException ||
  //       error instanceof NotFoundException
  //     ) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException(
  //       error.message || 'Error inesperado',
  //     );
  //   }
  // }

  async remove(id: string) {
    try {
      if(!id){
        throw new BadRequestException('Id invalido');
      }
      const result = await this.responsableRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();
      if (result.affected === 0)
        throw new NotFoundException('Responsable no encontrado');
      return this.responsableRepository.findOneBy({ id });
    } catch (error) {
      if( error instanceof NotFoundException){
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
