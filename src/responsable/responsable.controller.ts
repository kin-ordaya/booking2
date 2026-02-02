import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponsableService } from './responsable.service';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('responsable')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ResponsableController {
  constructor(private readonly responsableService: ResponsableService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear responsable',
    description: 'Crear un responsable del sistema con sus datos de creación.',
  })
  create(@Body() createResponsableDto: CreateResponsableDto) {
    return this.responsableService.create(createResponsableDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los responsables',
    description: 'Obtener todos los responsables del sistema.',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.responsableService.findAll(paginationDto);
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un responsable',
    description: 'Obtener un responsable del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.responsableService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateResponsableDto: UpdateResponsableDto,
  // ) {
  //   return this.responsableService.update(id, updateResponsableDto);
  // }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un responsable',
    description: 'Eliminar un responsable del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.responsableService.remove(id);
  }
}
