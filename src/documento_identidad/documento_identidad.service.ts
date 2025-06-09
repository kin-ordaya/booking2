import { Injectable } from '@nestjs/common';
import { CreateDocumentoIdentidadDto } from './dto/create-documento_identidad.dto';
import { UpdateDocumentoIdentidadDto } from './dto/update-documento_identidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { DocumentoIdentidad } from './entities/documento_identidad.entity';

@Injectable()
export class DocumentoIdentidadService {
  constructor(
    @InjectRepository(DocumentoIdentidad)
    private readonly documentoIdentidadRepository: Repository<DocumentoIdentidad>,
  ) {}

  async create(createDocumentoIdentidadDto: CreateDocumentoIdentidadDto) {
    return 'This action adds a new documentoIdentidad';
  }

  async findAll() {
    return `This action returns all documentoIdentidad`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} documentoIdentidad`;
  }

  async update(id: string, updateDocumentoIdentidadDto: UpdateDocumentoIdentidadDto) {
    return `This action updates a #${id} documentoIdentidad`;
  }

  async remove(id: string) {
    return `This action removes a #${id} documentoIdentidad`;
  }
}
