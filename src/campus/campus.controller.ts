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
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('campus')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear campus',
    description: 'Crea un nuevo registro de campus en el sistema.',
  })
  create(@Body() createCampusDto: CreateCampusDto) {
    return this.campusService.create(createCampusDto);
  }

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener todos los campus',
    description: 'Obtener todos los campus del sistema.',
  })
  findAll() {
    return this.campusService.findAll();
  }

  @Get(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.campusService.findOne(id);
  }

  @Patch(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateCampusDto: UpdateCampusDto,
  ) {
    return this.campusService.update(id, updateCampusDto);
  }

  @Delete(':id')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.campusService.remove(id);
  }
}
