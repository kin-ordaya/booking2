// import {
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { CreateRecursoCursoPeriodoDto } from './dto/create-recurso_curso_periodo.dto';
// import { Repository } from 'typeorm';
// import { RecursoCursoPeriodo } from './entities/recurso_curso_periodo.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { RecursoCurso } from 'src/recurso_curso/entities/recurso_curso.entity';
// import { Periodo } from 'src/periodo/entities/periodo.entity';
// import { GetRecursoCursoPeriodoDto } from './dto/get-recurso_curso_periodo.dto';

// @Injectable()
// export class RecursoCursoPeriodoService {
//   constructor(
//     @InjectRepository(RecursoCursoPeriodo)
//     private readonly recursoCursoPeriodoRepository: Repository<RecursoCursoPeriodo>,
//     @InjectRepository(RecursoCurso)
//     private readonly recursoCursoRepository: Repository<RecursoCurso>,
//     @InjectRepository(Periodo)
//     private readonly periodoRepository: Repository<Periodo>,
//   ) {}

//   // async create(createRecursoCursoPeriodoDto: CreateRecursoCursoPeriodoDto) {
//   //   try {
//   //     const { inicio, fin, recurso_curso_id, periodo_id } =
//   //       createRecursoCursoPeriodoDto;

//   //     const [recursoCursoExists, periodoExists] = await Promise.all([
//   //       this.recursoCursoRepository.existsBy({ id: recurso_curso_id }),
//   //       this.periodoRepository.existsBy({ id: periodo_id }),
//   //     ]);

//   //     if (!recursoCursoExists)
//   //       throw new NotFoundException('No existe un recurso curso con ese id');

//   //     if (!periodoExists)
//   //       throw new NotFoundException('No existe un periodo con ese id');

//   //     const recursoCursoPeriodoExists =
//   //       await this.recursoCursoPeriodoRepository.existsBy({
//   //         recurso_curso: { id: recurso_curso_id },
//   //         periodo: { id: periodo_id },
//   //       });

//   //     if (recursoCursoPeriodoExists)
//   //       throw new NotFoundException(
//   //         'Ya existe una asignacion de recurso a curso en ese periodo',
//   //       );

//   //     const recursoCursoPeriodo = this.recursoCursoPeriodoRepository.create({
//   //       inicio,
//   //       fin,
//   //       recurso_curso: { id: recurso_curso_id },
//   //       periodo: { id: periodo_id },
//   //     });

//   //     return await this.recursoCursoPeriodoRepository.save(recursoCursoPeriodo);
//   //   } catch (error) {
//   //     if (error instanceof NotFoundException) {
//   //       throw error;
//   //     }
//   //     throw new InternalServerErrorException('Error inesperado');
//   //   }
//   // }

//   // async findAll(getRecursoCursoPeriodoDto: GetRecursoCursoPeriodoDto) {
//   //   try {
//   //     const { recurso_id, curso_id, periodo_id } = getRecursoCursoPeriodoDto;

//   //     const queryBuilder = this.recursoCursoPeriodoRepository
//   //       .createQueryBuilder('rcp')
//   //       .leftJoinAndSelect('rcp.recurso_curso', 'rc')
//   //       .leftJoinAndSelect('rc.recurso', 'r')
//   //       .leftJoinAndSelect('rc.curso', 'c')
//   //       .leftJoinAndSelect('rcp.periodo', 'p')
//   //       .select([
//   //         'rcp.id',
//   //         'rcp.asignacion',
//   //         'rcp.estado',
//   //         'rcp.inicio',
//   //         'rcp.fin',
//   //       ])
//   //       .andWhere('p.id = :periodo_id', { periodo_id })
//   //       .andWhere('r.id = :recurso_id', { recurso_id })
//   //       .andWhere('c.id = :curso_id', { curso_id });

//   //     return await queryBuilder.getMany();
//   //   } catch (error) {
//   //     if (error instanceof NotFoundException) {
//   //       throw error;
//   //     }
//   //     throw new InternalServerErrorException('Error inesperado');
//   //   }
//   // }
// }
