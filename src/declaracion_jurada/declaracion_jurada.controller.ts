import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DeclaracionJuradaService } from './declaracion_jurada.service';
import { CreateDeclaracionJuradaDto } from './dto/create-declaracion_jurada.dto';
import { PaginationDeclaracionJuradaDto } from './dto/pagination-declaracion_jurada.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('declaracion-jurada')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class DeclaracionJuradaController {
  constructor(
    private readonly declaracionJuradaService: DeclaracionJuradaService,
  ) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Crear declaración jurada',
    description:
      'Crear una declaración jurada del sistema con sus datos de creación.',
  })
  create(@Body() createDeclaracionJuradaDto: CreateDeclaracionJuradaDto) {
    return this.declaracionJuradaService.create(createDeclaracionJuradaDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Obtener todas las declaraciones juradas',
    description: 'Obtener todas las declaraciones juradas del sistema.',
  })
  findAll(@Query() getDeclaracionJuradaDto: PaginationDeclaracionJuradaDto) {
    return this.declaracionJuradaService.findAll(getDeclaracionJuradaDto);
  }
}
