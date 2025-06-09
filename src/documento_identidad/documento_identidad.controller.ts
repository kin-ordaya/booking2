import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { DocumentoIdentidadService } from './documento_identidad.service';
import { CreateDocumentoIdentidadDto } from './dto/create-documento_identidad.dto';
import { UpdateDocumentoIdentidadDto } from './dto/update-documento_identidad.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';

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
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.documentoIdentidadService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body(new AtLeastOneFieldPipe()) updateDocumentoIdentidadDto: UpdateDocumentoIdentidadDto) {
    return this.documentoIdentidadService.update(id, updateDocumentoIdentidadDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.documentoIdentidadService.remove(id);
  }
}
