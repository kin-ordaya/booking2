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
import { FacultadService } from './facultad.service';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('facultad')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class FacultadController {
  constructor(private readonly facultadService: FacultadService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear facultad',
    description: 'Crear una facultad del sistema con sus datos de creación.',
  })
  create(@Body() createFacultadDto: CreateFacultadDto) {
    return this.facultadService.create(createFacultadDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todas las facultades',
    description: 'Obtener todas las facultades del sistema.',
  })
  findAll() {
    return this.facultadService.findAll();
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener una facultad',
    description: 'Obtener una facultad del sistema por su ID.',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.facultadService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar una facultad',
    description:
      'Actualizar una facultad del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateFacultadDto: UpdateFacultadDto,
  ) {
    return this.facultadService.update(id, updateFacultadDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar una facultad',
    description: 'Eliminar una facultad del sistema por su ID.',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.facultadService.remove(id);
  }
}
