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
import { RecursoCursoService } from './recurso_curso.service';
import { CreateRecursoCursoDto } from './dto/create-recurso_curso.dto';
import { UpdateRecursoCursoDto } from './dto/update-recurso_curso.dto';
import { PaginationRecursoCursoDto } from './dto/pagination-recurso_curso.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('recurso-curso')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RecursoCursoController {
  constructor(private readonly recursoCursoService: RecursoCursoService) {}

  // @Post()
  // @LogRequest()
  // @Roles('ADMINISTRADOR')
  // @ApiOperation({
  //   summary: 'Crear recurso de curso',
  //   description:
  //     'Crear un recurso de curso del sistema con sus datos de creación.',
  // })
  // create(@Body() createRecursoCursoDto: CreateRecursoCursoDto) {
  //   return this.recursoCursoService.create(createRecursoCursoDto);
  // }

  // @Get()
  // @LogRequest()
  // @Roles('ADMINISTRADOR')
  // @ApiOperation({
  //   summary: 'Obtener todos los recursos de curso',
  //   description: 'Obtener todos los recursos de curso del sistema.',
  // })
  // findAll(@Query() paginationRecursoCursoDto: PaginationRecursoCursoDto) {
  //   return this.recursoCursoService.findAll(paginationRecursoCursoDto);
  // }

  // @Get(':id')
  // @LogRequest()
  // @Roles('ADMINISTRADOR')
  // @ApiOperation({
  //   summary: 'Obtener un recurso de curso',
  //   description: 'Obtener un recurso de curso del sistema por su ID.',
  // })
  // findOne(@Param('id') id: string) {
  //   return this.recursoCursoService.findOne(id);
  // }

  // @Patch(':id')
  // @LogRequest()
  // @Roles('ADMINISTRADOR')
  // @ApiOperation({
  //   summary: 'Actualizar un recurso de curso',
  //   description:
  //     'Actualizar un recurso de curso del sistema por su ID y datos de actualización.',
  // })
  // update(
  //   @Param('id') id: string,
  //   @Body() updateRecursoCursoDto: UpdateRecursoCursoDto,
  // ) {
  //   return this.recursoCursoService.update(id, updateRecursoCursoDto);
  // }

  // @Delete(':id')
  // @LogRequest()
  // @Roles('ADMINISTRADOR')
  // @ApiOperation({
  //   summary: 'Eliminar un recurso de curso',
  //   description: 'Eliminar un recurso de curso del sistema por su ID.',
  // })
  // remove(@Param('id') id: string) {
  //   return this.recursoCursoService.remove(id);
  // }
}
