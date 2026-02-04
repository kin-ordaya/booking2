import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { RecursoCursoPeriodoService } from './recurso_curso_periodo.service';
import { CreateRecursoCursoPeriodoDto } from './dto/create-recurso_curso_periodo.dto';
import { GetRecursoCursoPeriodoDto } from './dto/get-recurso_curso_periodo.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('recurso-curso-periodo')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class RecursoCursoPeriodoController {
  constructor(
    private readonly recursoCursoPeriodoService: RecursoCursoPeriodoService,
  ) {}

  // @Post()
  // @LogRequest()
  // @Roles('ADMINISTRADOR')
  // @ApiOperation({
  //   summary: 'Crear recurso de curso periodo',
  //   description:
  //     'Crear un recurso de curso periodo del sistema con sus datos de creación.',
  // })
  // create(@Body() createRecursoCursoPeriodoDto: CreateRecursoCursoPeriodoDto) {
  //   return this.recursoCursoPeriodoService.create(createRecursoCursoPeriodoDto);
  // }

  // @Get()
  // @LogRequest()
  // @Roles('ADMINISTRADOR')
  // @ApiOperation({
  //   summary: 'Obtener todos los recursos de curso periodo',
  //   description: 'Obtener todos los recursos de curso periodo del sistema.',
  // })
  // findAll(@Query() getRecursoCursoPeriodoDto: GetRecursoCursoPeriodoDto) {
  //   return this.recursoCursoPeriodoService.findAll(getRecursoCursoPeriodoDto);
  // }
}
