import { PaginationDeclaracionJuradaDto } from './dto/pagination-declaracion_jurada.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeclaracionJuradaDto } from './dto/create-declaracion_jurada.dto';
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

      const [rolUsuarioDocente, recursoExists, declaracionJuradaExists] =
        await Promise.all([
          this.rolUsuarioRepository.findOne({
            where: {
              id: rol_usuario_id,
              rol: { nombre: 'DOCENTE' },
            },
          }),
          this.recursoRepository.existsBy({ id: recurso_id }),
          this.declaracionJuradaRepository.existsBy({
            recurso: { id: recurso_id },
            rolUsuario: { id: rol_usuario_id },
            estado: 1,
          }),
        ]);

      if (!rolUsuarioDocente) {
        throw new NotFoundException(
          'El rol de usuario proporcionado no existe o no es un docente',
        );
      }

      if (!recursoExists) {
        throw new NotFoundException('El recurso proporcionado no existe');
      }

      if (declaracionJuradaExists) {
        throw new BadRequestException(
          'Ya existe una declaración jurada para este recurso',
        );
      }

      const recursoAsignado = await this.verificarRecursoAsignadoDocente(
        rol_usuario_id,
        recurso_id,
      );

      if (!recursoAsignado) {
        throw new BadRequestException(
          'El usuario no tiene acceso a este recurso',
        );
      }

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
      throw new InternalServerErrorException(
        'Error al crear declaración jurada',
      );
    }
  }

  private async verificarRecursoAsignadoDocente(
    rolUsuarioId: string,
    recursoId: string,
  ): Promise<boolean> {
    const resultado = await this.responsableRepository
      .createQueryBuilder('responsable')
      .innerJoin('responsable.clase', 'clase')
      .innerJoin('clase.cursoModalidad', 'cursoModalidad')
      .innerJoin(
        'cursoModalidad.recursoCursoModalidad',
        'recursoCursoModalidad',
      )
      .innerJoin('recursoCursoModalidad.recurso', 'recurso')
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
        .leftJoin('declaracionJurada.rolUsuario', 'rolUsuario')
        .leftJoin('declaracionJurada.recurso', 'recurso');

      if (rol_usuario_id !== undefined) {
        query.andWhere('rolUsuario.id = :rol_usuario_id', { rol_usuario_id });
      }

      if (recurso_id !== undefined) {
        query.andWhere('recurso.id = :recurso_id', { recurso_id });
      }

      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al recuperar declaraciones juradas',
      );
    }
  }
}
