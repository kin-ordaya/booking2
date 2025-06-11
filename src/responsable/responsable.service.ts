import {
  BadRequestException,
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
      const { rol_usuario_id, recurso_id, clase_id, curso_modalidad_id } =
        createResponsableDto;

      // 1. Validar que solo se envíe un campo opcional
      const optionalFields = [recurso_id, clase_id, curso_modalidad_id].filter(
        Boolean,
      );
      if (optionalFields.length !== 1) {
        throw new BadRequestException(
          'Debe proporcionarse exactamente uno de los siguientes campos: recurso_id, clase_id o curso_modalidad_id',
        );
      }

      // 2. Definir tipo e ID del recurso opcional
      let resourceType: string;
      let resourceId: string;
      const checks: Promise<boolean>[] = []; // <- Tipo explícito para el array

      if (recurso_id) {
        checks.push(this.recursoRepository.existsBy({ id: recurso_id }));
        resourceType = 'recurso';
        resourceId = recurso_id;
      } else if (clase_id) {
        checks.push(this.claseRepository.existsBy({ id: clase_id }));
        resourceType = 'clase';
        resourceId = clase_id;
      } else if (curso_modalidad_id) {
        checks.push(
          this.cursoModalidadRepository.existsBy({ id: curso_modalidad_id }),
        );
        resourceType = 'cursoModalidad';
        resourceId = curso_modalidad_id;
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

      // 5. Crear y guardar
      const responsable = this.responsableRepository.create({
        rolUsuario: { id: rol_usuario_id },
        ...(recurso_id && { recurso: { id: recurso_id } }),
        ...(clase_id && { clase: { id: clase_id } }),
        ...(curso_modalidad_id && {
          cursoModalidad: { id: curso_modalidad_id },
        }),
      });

      return await this.responsableRepository.save(responsable);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'Error inesperado',
      );
    }
  }

  async findAll() {
    return `This action returns all responsable`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} responsable`;
  }

  async update(id: string, updateResponsableDto: UpdateResponsableDto) {
    return `This action updates a #${id} responsable`;
  }

  async remove(id: string) {
    return `This action removes a #${id} responsable`;
  }
}
