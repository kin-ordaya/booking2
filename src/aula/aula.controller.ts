import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AulaService } from './aula.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('aula')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class AulaController {
  constructor(private readonly aulaService: AulaService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear aula',
    description: 'Crea un nuevo registro de aula fisica en el sistema.\n\n**Roles permitidos:** ADMINISTRADOR',
  })
  create(@Body() createAulaDto: CreateAulaDto) {
    return this.aulaService.create(createAulaDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todas las aulas',
    description: 'Obtener todas las aulas fisicas del sistema.',
  })
  findAll() {
    return this.aulaService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener una aula',
    description: 'Obtener una aula fisica del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.aulaService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar una aula',
    description:
      'Actualizar una aula fisica del sistema por su ID y datos de actualización.',
  })
  update(@Param('id') id: string, @Body() updateAulaDto: UpdateAulaDto) {
    return this.aulaService.update(id, updateAulaDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar una aula',
    description: 'Eliminar logicamente una aula fisica del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.aulaService.remove(id);
  }
}
