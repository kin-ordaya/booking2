import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DocumentoIdentidad } from 'src/documento_identidad/entities/documento_identidad.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(DocumentoIdentidad)
    private readonly documentoIdentidadRepository: Repository<DocumentoIdentidad>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const {
        numero_documento,
        correo_institucional,
        telefono_institucional,
        documento_identidad_id,
      } = createUsuarioDto;

      // Verificar documento_identidad
      const documento_identidad =
        await this.documentoIdentidadRepository.findOneBy({
          id: documento_identidad_id,
        });
      if (!documento_identidad)
        throw new NotFoundException(
          'No existe un documento identidad con ese id',
        );

      // Verificar duplicados en una sola consulta
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: [
          {
            documento_identidad: { id: documento_identidad_id },
            numero_documento,
          },
          { correo_institucional },
          { telefono_institucional },
        ],
      });

      if (usuarioExistente) {
        if (usuarioExistente.numero_documento === numero_documento) {
          throw new ConflictException(
            'Ya existe un usuario con ese número de documento',
          );
        }
        if (usuarioExistente.correo_institucional === correo_institucional) {
          throw new ConflictException(
            'Ya existe un usuario con ese correo institucional',
          );
        }
        if (
          usuarioExistente.telefono_institucional === telefono_institucional
        ) {
          throw new ConflictException(
            'Ya existe un usuario con ese teléfono institucional',
          );
        }
      }

      // Crear y guardar
      const usuario = this.usuarioRepository.create({
        ...createUsuarioDto,
        documento_identidad,
      });

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error inesperado al crear el usuario',
      );
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page, limit, search } = paginationDto;
      const query = this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.documento_identidad', 'documento_identidad')
        .select([
          'usuario.id',
          'usuario.nombres',
          'usuario.apellidos',
          'usuario.numero_documento',
          'usuario.correo_institucional',
          'usuario.correo_personal',
          'usuario.telefono_institucional',
          'usuario.telefono_personal',
          'usuario.sexo',
          'usuario.direccion',
          'documento_identidad.nombre',
        ]);

      if (search) {
        query.where(
          'UPPER(usuario.nombres) LIKE UPPER(:search) OR UPPER(usuario.apellidos) LIKE UPPER(:search) OR UPPER(usuario.numero_documento) LIKE UPPER(:search)',
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del usuario no puede estar vacío');
      const usuario = await this.usuarioRepository.findOneBy({ id });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      return usuario;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const { numero_documento, correo_institucional, telefono_institucional } =
        updateUsuarioDto;

      if (!id)
        throw new BadRequestException('El ID del usuario no puede estar vacío');

      const usuario = await this.usuarioRepository.findOneBy({ id });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const updateData: any = {};

      if (numero_documento !== undefined) {
        const numero_documentoExists = await this.usuarioRepository.existsBy({
          id: Not(id),
          numero_documento,
          documento_identidad: { id: usuario.documento_identidad.id },
        });
        if (numero_documentoExists) {
          throw new ConflictException(
            'Ya existe un usuario con ese número de documento y ese documento identidad',
          );
        }
        updateData.numero_documento = numero_documento;
      }

      if (correo_institucional !== undefined) {
        const correo_institucionalExists =
          await this.usuarioRepository.existsBy({
            id: Not(id),
            correo_institucional,
          });
        if (correo_institucionalExists) {
          throw new ConflictException(
            'Ya existe un usuario con ese correo institucional',
          );
        }
        updateData.correo_institucional = correo_institucional;
      }

      if (telefono_institucional !== undefined) {
        const telefono_institucionalExists =
          await this.usuarioRepository.existsBy({
            id: Not(id),
            telefono_institucional,
          });
        if (telefono_institucionalExists) {
          throw new ConflictException(
            'Ya existe un usuario con ese teléfono institucional',
          );
        }
        updateData.telefono_institucional = telefono_institucional;
      }

      if (Object.keys(updateData).length === 0) {
        return usuario;
      }

      await this.usuarioRepository.update(id, updateData);

      return await this.usuarioRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException('El ID del usuario no puede estar vacío');

      const result = await this.usuarioRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Usuario no encontrado');
      return this.usuarioRepository.findOneBy({ id });
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
