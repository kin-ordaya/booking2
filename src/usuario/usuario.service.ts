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
import { DataSource, Not, Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DocumentoIdentidad } from 'src/documento_identidad/entities/documento_identidad.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(DocumentoIdentidad)
    private readonly documentoIdentidadRepository: Repository<DocumentoIdentidad>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,

    //dataSource
    private readonly dataSource: DataSource,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      return await this.dataSource.transaction(
        async (transactionalEntityManager) => {
          const {
            numero_documento,
            correo_institucional,
            telefono_institucional,
            documento_identidad_id,
            rol_id,
          } = createUsuarioDto;

          // 1. Verificar documento_identidad
          const documento_identidad =
            await transactionalEntityManager.findOneBy(DocumentoIdentidad, {
              id: documento_identidad_id,
            });
          if (!documento_identidad) {
            throw new NotFoundException('Documento de identidad no encontrado');
          }

          // 2. Verificar duplicados
          const usuarioExistente = await transactionalEntityManager.findOne(
            Usuario,
            {
              where: [
                {
                  documento_identidad: { id: documento_identidad_id },
                  numero_documento,
                },
                ...(correo_institucional ? [{ correo_institucional }] : []),
                ...(telefono_institucional ? [{ telefono_institucional }] : []),
              ],
            },
          );

          if (usuarioExistente) {
            if (usuarioExistente.numero_documento === numero_documento) {
              throw new ConflictException(
                'Ya existe un usuario con ese número de documento',
              );
            }
            if (
              usuarioExistente.correo_institucional === correo_institucional
            ) {
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

          // 3. Crear usuario
          const usuario = transactionalEntityManager.create(Usuario, {
            ...createUsuarioDto,
            documento_identidad,
          });
          await transactionalEntityManager.save(usuario);

          // 4. Verificar y asignar rol
          const rolExists = await transactionalEntityManager.existsBy(Rol, {
            id: rol_id,
          });
          if (!rolExists) throw new NotFoundException('Rol no encontrado');

          const rolUsuarioExists = await transactionalEntityManager.existsBy(
            RolUsuario,
            {
              usuario: { id: usuario.id },
              rol: { id: rol_id },
            },
          );
          if (rolUsuarioExists)
            throw new ConflictException('Rol ya asignado a usuario');

          await transactionalEntityManager.save(RolUsuario, {
            usuario: { id: usuario.id },
            rol: { id: rol_id },
          });

          return usuario;
        },
      );
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page, limit, search } = paginationDto;

      // Paso 1: Obtener usuarios paginados
      const query = this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.documento_identidad', 'documento_identidad')
        .select([
          'usuario.id',
          'usuario.nombres',
          'usuario.apellidos',
          'usuario.numero_documento',
          'usuario.correo_institucional',
          'documento_identidad.nombre',
        ]);

      if (search) {
        query.where(
          'UPPER(usuario.nombres) LIKE UPPER(:search) OR UPPER(usuario.apellidos) LIKE UPPER(:search) OR UPPER(usuario.numero_documento) LIKE UPPER(:search)',
          { search: `%${search}%` },
        );
      }

      const [usuarios, count] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        results: usuarios,
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
      const {
        nombres,
        apellidos,
        numero_documento,
        correo_institucional,
        telefono_institucional,
        correo_personal,
        telefono_personal,
        sexo,
        direccion,
      } = updateUsuarioDto;
      updateUsuarioDto;

      if (!id)
        throw new BadRequestException('El ID del usuario no puede estar vacío');

      const usuario = await this.usuarioRepository.findOne({
        where: { id },
        relations: ['documento_identidad'],
      });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // const updateData: any = {};

      if (numero_documento) {
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
        // updateData.numero_documento = numero_documento;
      }

      if (correo_institucional) {
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
        // updateData.correo_institucional = correo_institucional;
      }

      if (telefono_institucional) {
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
        // updateData.telefono_institucional = telefono_institucional;
      }

      // if (Object.keys(updateData).length === 0) {
      //   return usuario;
      // }

      await this.usuarioRepository.update(id, {
        nombres,
        apellidos,
        numero_documento,
        correo_institucional,
        telefono_institucional,
        correo_personal,
        telefono_personal,
        sexo,
        direccion,
      });

      return await this.usuarioRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
      //throw error;
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

  async uploadExcel(
  usuarios: any[], // Recibes datos crudos
): Promise<{ exitos: number; errores: any[] }> {
  const errores: any[] = [];
  let exitos = 0;

  for (const [index, usuarioData] of usuarios.entries()) {
    try {
      // 1. Transformar a instancia de CreateUsuarioDto
      const usuarioDto = plainToInstance(CreateUsuarioDto, usuarioData);
      
      // 2. Validar con class-validator
      const validationErrors = await validate(usuarioDto);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validación fallida: ${JSON.stringify(validationErrors.map(e => e.property))}`);
      }

      // 3. Si pasa validación, crear el usuario
      await this.create(usuarioDto);
      exitos++;
      
    } catch (error) {
      errores.push({
        indice: index + 1,
        datos: usuarioData,
        error: error.message || error
      });
    }
  }
  
  return { exitos, errores };
}
}
