import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { DocumentoIdentidadService } from './documento_identidad.service';
import { CreateDocumentoIdentidadDto } from './dto/create-documento_identidad.dto';
import { UpdateDocumentoIdentidadDto } from './dto/update-documento_identidad.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('documento-identidad')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class DocumentoIdentidadController {
  constructor(
    private readonly documentoIdentidadService: DocumentoIdentidadService,
  ) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createDocumentoIdentidadDto: CreateDocumentoIdentidadDto) {
    return this.documentoIdentidadService.create(createDocumentoIdentidadDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.documentoIdentidadService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.documentoIdentidadService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe())
    updateDocumentoIdentidadDto: UpdateDocumentoIdentidadDto,
  ) {
    return this.documentoIdentidadService.update(
      id,
      updateDocumentoIdentidadDto,
    );
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.documentoIdentidadService.remove(id);
  }
}
