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
} from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { SearchDto } from 'src/common/dtos/search.dto';

@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @Get()
  findAll(@Query() searchDto: SearchDto) {
    return this.proveedorService.findAll(searchDto);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.proveedorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedorService.update(id, updateProveedorDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.proveedorService.remove(id);
  }
}
