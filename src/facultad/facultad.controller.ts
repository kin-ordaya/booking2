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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('facultad')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class FacultadController {
  constructor(private readonly facultadService: FacultadService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createFacultadDto: CreateFacultadDto) {
    return this.facultadService.create(createFacultadDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.facultadService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.facultadService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateFacultadDto: UpdateFacultadDto,
  ) {
    return this.facultadService.update(id, updateFacultadDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.facultadService.remove(id);
  }
}
