import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { SearchDto } from 'src/common/dtos/search.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('proveedor')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @Get()
  findAll(@Query() searchDto: SearchDto) {
    return this.proveedorService.findAll(searchDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.proveedorService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedorService.update(id, updateProveedorDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.proveedorService.remove(id);
  }
}
