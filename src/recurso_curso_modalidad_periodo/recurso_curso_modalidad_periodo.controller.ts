import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecursoCursoModalidadPeriodoService } from './recurso_curso_modalidad_periodo.service';
import { CreateRecursoCursoModalidadPeriodoDto } from './dto/create-recurso_curso_modalidad_periodo.dto';
import { UpdateRecursoCursoModalidadPeriodoDto } from './dto/update-recurso_curso_modalidad_periodo.dto';
import { GetRecursoCursoModalidadPeriodoDto } from './dto/get-recurso_curso_modalidad_periodo.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('recurso-curso-modalidad-periodo')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RecursoCursoModalidadPeriodoController {
  constructor(
    private readonly recursoCursoModalidadPeriodoService: RecursoCursoModalidadPeriodoService,
  ) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear recurso curso modalidad periodo',
    description:
      'Crear un recurso curso modalidad periodo del sistema con sus datos de creación.',
  })
  create(
    @Body()
    createRecursoCursoModalidadPeriodoDto: CreateRecursoCursoModalidadPeriodoDto,
  ) {
    return this.recursoCursoModalidadPeriodoService.create(
      createRecursoCursoModalidadPeriodoDto,
    );
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los recursos curso modalidad periodo',
    description: 'Obtener todos los recursos curso modalidad periodo del sistema.',
  })
  findAll(
    @Query()
    getRecursoCursoModalidadPeriodoDto: GetRecursoCursoModalidadPeriodoDto,
  ) {
    return this.recursoCursoModalidadPeriodoService.findAll(
      getRecursoCursoModalidadPeriodoDto,
    );
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un recurso curso modalidad periodo',
    description: 'Obtener un recurso curso modalidad periodo del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.recursoCursoModalidadPeriodoService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un recurso curso modalidad periodo',
    description:
      'Actualizar un recurso curso modalidad periodo del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id') id: string,
    @Body()
    updateRecursoCursoModalidadPeriodoDto: UpdateRecursoCursoModalidadPeriodoDto,
  ) {
    return this.recursoCursoModalidadPeriodoService.update(
      id,
      updateRecursoCursoModalidadPeriodoDto,
    );
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un recurso curso modalidad periodo',
    description: 'Eliminar un recurso curso modalidad periodo del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.recursoCursoModalidadPeriodoService.remove(id);
  }
}
