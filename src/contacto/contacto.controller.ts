import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { PaginationContactoDto } from './dto/pagination-contacto.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('contacto')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear contacto',
    description:
      'Crear un contacto del sistema con sus datos de creación.',
  })
  create(@Body() createContactoDto: CreateContactoDto) {
    return this.contactoService.create(createContactoDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los contactos',
    description: 'Obtener todos los contactos del sistema.',
  })
  findAll(@Query() paginationContactoDto: PaginationContactoDto) {
    return this.contactoService.findAll(paginationContactoDto);
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un contacto',
    description: 'Obtener un contacto del sistema por su ID.',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contactoService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un contacto',
    description:
      'Actualizar un contacto del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateContactoDto: UpdateContactoDto,
  ) {
    return this.contactoService.update(id, updateContactoDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un contacto',
    description: 'Eliminar un contacto del sistema por su ID.',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contactoService.remove(id);
  }
}
