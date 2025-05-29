import { Injectable } from '@nestjs/common';
import { CreateDocumentoIdentidadDto } from './dto/create-documento_identidad.dto';
import { UpdateDocumentoIdentidadDto } from './dto/update-documento_identidad.dto';

@Injectable()
export class DocumentoIdentidadService {
  create(createDocumentoIdentidadDto: CreateDocumentoIdentidadDto) {
    return 'This action adds a new documentoIdentidad';
  }

  findAll() {
    return `This action returns all documentoIdentidad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} documentoIdentidad`;
  }

  update(id: number, updateDocumentoIdentidadDto: UpdateDocumentoIdentidadDto) {
    return `This action updates a #${id} documentoIdentidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} documentoIdentidad`;
  }
}
