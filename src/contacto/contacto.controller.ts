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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('contacto')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createContactoDto: CreateContactoDto) {
    return this.contactoService.create(createContactoDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationContactoDto: PaginationContactoDto) {
    return this.contactoService.findAll(paginationContactoDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contactoService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateContactoDto: UpdateContactoDto,
  ) {
    return this.contactoService.update(id, updateContactoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contactoService.remove(id);
  }
}
