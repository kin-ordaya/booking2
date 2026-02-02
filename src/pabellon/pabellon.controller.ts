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
import { PabellonService } from './pabellon.service';
import { CreatePabellonDto } from './dto/create-pabellon.dto';
import { UpdatePabellonDto } from './dto/update-pabellon.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('pabellon')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class PabellonController {
  constructor(private readonly pabellonService: PabellonService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear pabellón',
    description: 'Crear un pabellón del sistema con sus datos de creación.',
  })
  create(@Body() createPabellonDto: CreatePabellonDto) {
    return this.pabellonService.create(createPabellonDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los pabellónes',
    description: 'Obtener todos los pabellónes del sistema.',
  })
  findAll() {
    return this.pabellonService.findAll();
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener un pabellón',
    description: 'Obtener un pabellón del sistema por su ID.',
  })
  findOne(@Param('id') id: string) {
    return this.pabellonService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un pabellón',
    description:
      'Actualizar un pabellón del sistema por su ID y datos de actualización.',
  })
  update(
    @Param('id') id: string,
    @Body() updatePabellonDto: UpdatePabellonDto,
  ) {
    return this.pabellonService.update(id, updatePabellonDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar un pabellón',
    description: 'Eliminar un pabellón del sistema por su ID.',
  })
  remove(@Param('id') id: string) {
    return this.pabellonService.remove(id);
  }
}
