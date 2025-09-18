import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentoIdentidadDto } from './dto/create-documento_identidad.dto';
import { UpdateDocumentoIdentidadDto } from './dto/update-documento_identidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { DocumentoIdentidad } from './entities/documento_identidad.entity';
import { Not } from 'typeorm';

@Injectable()
export class DocumentoIdentidadService {
  constructor(
    @InjectRepository(DocumentoIdentidad)
    private readonly documentoIdentidadRepository: Repository<DocumentoIdentidad>,
  ) {}

  async create(createDocumentoIdentidadDto: CreateDocumentoIdentidadDto) {
    try {
      const { nombre } = createDocumentoIdentidadDto;

      const nombreExists = await this.documentoIdentidadRepository.existsBy({
        nombre,
      });

      if (nombreExists)
        throw new ConflictException(
          'Ya existe un documento identidad con ese nombre',
        );

      const documentoIdentidad = this.documentoIdentidadRepository.create({
        nombre,
      });

      return await this.documentoIdentidadRepository.save(documentoIdentidad);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findAll() {
    try {
      return await this.documentoIdentidadRepository.find({
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error inesperado', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del documento identidad no puede estar vacío',
        );
      const documentoIdentidad =
        await this.documentoIdentidadRepository.findOneBy({ id });
      if (!documentoIdentidad)
        throw new NotFoundException('Documento identidad no encontrado');
      return documentoIdentidad;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findOneByNombre(nombre: string) {
    try {
      console.log(nombre);
      if (!nombre)
        throw new BadRequestException(
          'El nombre del documento identidad no puede estar vacío',
        );
      const documentoIdentidad =
        await this.documentoIdentidadRepository.findOne({
          where: {
            nombre,
          },
        });
      if (!documentoIdentidad)
        throw new NotFoundException('Documento identidad no encontrado');
      return documentoIdentidad;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async update(
    id: string,
    updateDocumentoIdentidadDto: UpdateDocumentoIdentidadDto,
  ) {
    try {
      const { nombre } = updateDocumentoIdentidadDto;
      if (!id)
        throw new BadRequestException(
          'El ID del documento identidad no puede estar vacío',
        );

      const documentoIdentidad =
        await this.documentoIdentidadRepository.findOneBy({ id });
      if (!documentoIdentidad) {
        throw new NotFoundException('Documento identidad no encontrado');
      }
      const updateData: any = {};

      if (nombre !== undefined) {
        const nombreExists = await this.documentoIdentidadRepository.existsBy({
          id: Not(id),
          nombre,
        });

        if (nombreExists) {
          throw new ConflictException(
            'Ya existe un documento identidad con ese nombre',
          );
        }
        updateData.nombre = nombre;
      }
      if (Object.keys(updateData).length === 0) {
        return documentoIdentidad;
      }

      await this.documentoIdentidadRepository.update(id, updateData);
      return await this.documentoIdentidadRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async remove(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'El ID del documento identidad no puede estar vacío',
        );

      const result = await this.documentoIdentidadRepository
        .createQueryBuilder()
        .update()
        .set({ estado: () => 'CASE WHEN estado = 1 THEN 0 ELSE 1 END' })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0)
        throw new NotFoundException('Documento identidad no encontrado');

      return this.documentoIdentidadRepository.findOneBy({ id });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
}
