import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentoIdentidadService } from './documento_identidad.service';
import { CreateDocumentoIdentidadDto } from './dto/create-documento_identidad.dto';
import { UpdateDocumentoIdentidadDto } from './dto/update-documento_identidad.dto';

@Controller('documento-identidad')
export class DocumentoIdentidadController {
  constructor(private readonly documentoIdentidadService: DocumentoIdentidadService) {}

  @Post()
  create(@Body() createDocumentoIdentidadDto: CreateDocumentoIdentidadDto) {
    return this.documentoIdentidadService.create(createDocumentoIdentidadDto);
  }

  @Get()
  findAll() {
    return this.documentoIdentidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentoIdentidadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentoIdentidadDto: UpdateDocumentoIdentidadDto) {
    return this.documentoIdentidadService.update(+id, updateDocumentoIdentidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentoIdentidadService.remove(+id);
  }
}
