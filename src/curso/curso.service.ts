import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Not, Repository } from 'typeorm';
import { PaginationCursoDto } from './dto/pagination.dto';
import { Eap } from 'src/eap/entities/eap.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';


@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Eap)
    private readonly eapRepository: Repository<Eap>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>
  ) {}

  async create(createCursoDto: CreateCursoDto): Promise<Curso> {
    try {
      const { codigo, eap_id, plan_id } = createCursoDto;

      const [codigoExiste, planExiste, eapExiste] = await Promise.all([
        this.cursoRepository.existsBy({ codigo }),
        this.planRepository.existsBy({ id: plan_id }),
        eap_id ? this.eapRepository.existsBy({ id: eap_id }) : true,
      ]);

      if (codigoExiste) throw new ConflictException('Código ya existe');

      if (!planExiste) throw new NotFoundException('Plan no encontrado');

      if (eap_id && !eapExiste)
        throw new NotFoundException('EAP no encontrado');

      // Creación del curso
      const curso = this.cursoRepository.create({
        ...createCursoDto,
        eap: eap_id ? { id: eap_id } : undefined,
        plan: { id: plan_id },
      });

      return await this.cursoRepository.save(curso);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear curso');
    }
  }

  async findAll(paginationCursoDto: PaginationCursoDto) {
    try {
      const { page, limit, sort_name, sort_state, search } = paginationCursoDto;

      const query = this.cursoRepository
        .createQueryBuilder('curso')
        .leftJoinAndSelect('curso.plan', 'plan')
        .select([
          'curso.id',
          'curso.nombre',
          'curso.creacion',
          'curso.codigo',
          'curso.estado',
          'plan.nombre',
        ]);

      let orderApplied = false;

      if (sort_name) {
        query.orderBy('curso.nombre', sort_name === 1 ? 'ASC' : 'DESC');
        orderApplied = true;
      }

      if (!orderApplied) {
        query.orderBy('curso.creacion', 'DESC');
      }

      if (sort_state) {
        switch (sort_state.toString()) {
          case '1':
            query.andWhere('curso.estado = :estado', { estado: 1 });
            break;
          case '2':
            query.andWhere('curso.estado = :estado', { estado: 0 });
            break;
        }
      }

      if (search) {
        query.where(
          'UPPER(curso.codigo) LIKE UPPER(:search) OR UPPER(curso.nombre) LIKE UPPER(:search)',
          {
            search: `%${search}%`,
          },
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
      throw new InternalServerErrorException(
        'Ocurrió un error al recuperar las Cursos',
        { cause: error },
      );
    }
  }

  // async getCursosByRecursoDocente(
  //   recursoDocenteCursoDto: RecursoDocenteCursoDto,
  // ) {
  //   try {
  //     const { recurso_id, rol_usuario_id } = recursoDocenteCursoDto;

  //     // Verificaciones iniciales (se mantienen igual)
  //     const [recursoExists, rolUsuarioExists] = await Promise.all([
  //       this.recursoRepository.existsBy({ id: recurso_id }),
  //       this.rolUsuarioRepository.findOne({
  //         where: { id: rol_usuario_id },
  //         relations: ['rol'],
  //       }),
  //     ]);

  //     if (!recursoExists) throw new NotFoundException('No existe un recurso con ese id');
  //     if (!rolUsuarioExists) throw new NotFoundException('No existe un docente con ese id');
  //     if (rolUsuarioExists.rol.nombre !== 'DOCENTE') {
  //       throw new BadRequestException('El usuario no tiene rol de DOCENTE');
  //     }

  //     // Consulta principal corregida
  //     return await this.cursoRepository
  //       .createQueryBuilder('curso')
  //       // Relación con recurso (para filtrar)
  //       .innerJoin('curso.recurso_curso', 'recursoCurso')
  //       .innerJoin('recursoCurso.recurso', 'recurso', 'recurso.id = :recursoId', { recursoId: recurso_id })
  //       // Relación con el docente a través de responsable
  //       .innerJoin('curso.curso_modalidad', 'cursoModalidad')
  //       .innerJoin('cursoModalidad.clase', 'clase')
  //       .innerJoin('clase.responsable', 'responsable')
  //       .innerJoin('responsable.rolUsuario', 'rolUsuario', 'rolUsuario.id = :rolUsuarioId', { rolUsuarioId: rol_usuario_id })
  //       .innerJoin('rolUsuario.rol', 'rol', 'rol.nombre = :rolNombre', { rolNombre: 'DOCENTE' })
  //       .innerJoin('rolUsuario.usuario', 'usuario', 'usuario.estado = 1')
  //       // Selección de campos
  //       .select([
  //         'curso.id',
  //         'curso.codigo',
  //         'curso.nombre',
  //         'curso.estado'])
  //       .getMany();
  //   } catch (error) {
  //     if (error instanceof NotFoundException || error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw error
  //   }
  // }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del curso no puede estar vacío');
      const curso = await this.cursoRepository.findOneBy({ id });
      if (!curso) throw new NotFoundException('Curso no encontrado');
      return curso;
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

  async update(id: string, updateCursoDto: UpdateCursoDto) {
    try {
      const { codigo, nombre, descripcion, eap_id, plan_id } = updateCursoDto;

      if (!id) {
        throw new BadRequestException('El ID del curso no puede estar vacío');
      }

      const curso = await this.cursoRepository.findOneBy({ id });
      if (!curso) {
        throw new NotFoundException('No existe un curso con ese id');
      }

      const updateData: any = {};

      if (codigo !== undefined) {
        const codigoExistente = await this.cursoRepository.existsBy({
          id: Not(id),
          codigo,
        });

        if (codigoExistente) {
          throw new ConflictException('Ya existe un curso con ese codigo');
        }
        updateData.codigo = codigo;
      }

      if (eap_id !== undefined) {
        const eapExists = await this.eapRepository.existsBy({
          id: eap_id,
        });

        if (!eapExists) {
          throw new NotFoundException('No existe una EAP con ese ID');
        }
        updateData.eap = { id: eap_id };
      }

      if (plan_id !== undefined) {
        const planExists = await this.planRepository.existsBy({
          id: plan_id,
        });

        if (!planExists) {
          throw new NotFoundException('No existe un plan con ese ID');
        }
        updateData.plan = { id: plan_id };
      }

      if (nombre !== undefined) {
        updateData.nombre = nombre;
      }

      if (descripcion !== undefined) {
        updateData.descripcion = descripcion;
      }

      if (Object.keys(updateData).length === 0) {
        return curso;
      }

      await this.cursoRepository.update(id, updateData);

      return await this.cursoRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del curso no puede estar vacío');

      const result = await this.cursoRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Curso no encontrado');
      return this.cursoRepository.findOneBy({ id });
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
