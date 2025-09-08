import { PaginationDeclaracionJuradaDto } from './dto/pagination-declaracion_jurada.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeclaracionJuradaDto } from './dto/create-declaracion_jurada.dto';
import { UpdateDeclaracionJuradaDto } from './dto/update-declaracion_jurada.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeclaracionJurada } from './entities/declaracion_jurada.entity';
import { Repository } from 'typeorm';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';

@Injectable()
export class DeclaracionJuradaService {
  constructor(
    @InjectRepository(DeclaracionJurada)
    private readonly declaracionJuradaRepository: Repository<DeclaracionJurada>,

    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(Responsable)
    private readonly responsableRepository: Repository<Responsable>,
  ) {}

  async create(createDeclaracionJuradaDto: CreateDeclaracionJuradaDto) {
    try {
      const { rol_usuario_id, recurso_id } = createDeclaracionJuradaDto;

      // 1. Validar que el rol_usuario_id existe si fue proporcionado
      const rolUsuario = await this.rolUsuarioRepository.findOne({
        where: { id: rol_usuario_id },
        relations: ['usuario', 'rol'],
      });

      if (!rolUsuario) {
        throw new NotFoundException(
          'El rol de usuario proporcionado no existe',
        );
      }

      // 2. Validar que el recurso_id existe si fue proporcionado
      const recurso = await this.recursoRepository.findOne({
        where: { id: recurso_id },
        relations: ['tipoAcceso', 'proveedor', 'tipoRecurso'],
      });

      if (!recurso) {
        throw new NotFoundException('El recurso proporcionado no existe');
      }

      // 3. Validar permisos (solo DOCENTE)
      if (rolUsuario.rol.nombre !== 'DOCENTE') {
        throw new BadRequestException(
          'Solo docentes pueden registrar declaraciones juradas',
        );
      }

      //4. Validar que no exista una declaracion jurada para este recurso
      const declaracionJuradaExists =
        await this.declaracionJuradaRepository.findOne({
          where: {
            estado: '1',
            rolUsuario: { id: rol_usuario_id },
            recurso: { id: recurso_id },
          },
        });
      if (declaracionJuradaExists) {
        throw new BadRequestException(
          'Ya existe una declaracion jurada para este recurso',
        );
      }

      // 5. Validacion extensa:
      const recursoAsignado = await this.verificarRecursoAsignadoDocente(
        rol_usuario_id,
        recurso_id,
      );
      if (!recursoAsignado) {
        throw new BadRequestException(
          'El usuario no tiene acceso a este recurso',
        );
      }

      // 6. Crear declaracionJurada
      const declaracionJurada = this.declaracionJuradaRepository.create({
        rolUsuario: { id: rol_usuario_id },
        recurso: { id: recurso_id },
      });

      return await this.declaracionJuradaRepository.save(declaracionJurada);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  private async verificarRecursoAsignadoDocente(
    rolUsuarioId: string,
    recursoId: string,
  ): Promise<boolean> {
    const resultado = await this.responsableRepository
      .createQueryBuilder('responsable')
      .innerJoin('responsable.clase', 'clase') // Cambio: relación con Clase
      .innerJoin('clase.cursoModalidad', 'cursoModalidad') // Desde Clase a CursoModalidad
      .innerJoin('cursoModalidad.curso', 'curso')
      .innerJoin('curso.recurso_curso', 'recursoCurso')
      .innerJoin('recursoCurso.recurso', 'recurso')
      .where('responsable.rol_usuario_id = :rolUsuarioId', { rolUsuarioId })
      .andWhere('recurso.id = :recursoId', { recursoId })
      .getCount();

    return resultado > 0;
  }

  async findAll(getDeclaracionJuradaDto: PaginationDeclaracionJuradaDto) {
    try {
      const { rol_usuario_id, recurso_id } = getDeclaracionJuradaDto;

      const query = this.declaracionJuradaRepository
        .createQueryBuilder('declaracionJurada')
        .where('declaracionJurada.estado = :estado', { estado: 1 })
        .leftJoin('declaracionJurada.rolUsuario', 'rolUsuario') // Agregar JOIN para rolUsuario
        .leftJoin('declaracionJurada.recurso', 'recurso'); // Agregar JOIN para recurso

      // 1. Validar que el rol_usuario_id existe si fue proporcionado
      if (rol_usuario_id) {
        const rolUsuario = await this.rolUsuarioRepository.existsBy({
          id: rol_usuario_id,
        });

        if (!rolUsuario) {
          throw new NotFoundException(
            'El rol de usuario proporcionado no existe',
          );
        }

        query.andWhere('rolUsuario.id = :rol_usuario_id', { rol_usuario_id });
      }

      // 2. Validar que el recurso_id existe si fue proporcionado
      if (recurso_id) {
        const recurso = await this.recursoRepository.existsBy({
          id: recurso_id,
        });

        if (!recurso) {
          throw new NotFoundException('El recurso proporcionado no existe');
        }

        query.andWhere('recurso.id = :recurso_id', { recurso_id });
      }

      return await query.getMany();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw error;
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} declaracionJurada`;
  }

  update(id: number, updateDeclaracionJuradaDto: UpdateDeclaracionJuradaDto) {
    return `This action updates a #${id} declaracionJurada`;
  }

  remove(id: number) {
    return `This action removes a #${id} declaracionJurada`;
  }
}
