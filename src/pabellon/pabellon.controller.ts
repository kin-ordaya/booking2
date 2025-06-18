import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PabellonService } from './pabellon.service';
import { CreatePabellonDto } from './dto/create-pabellon.dto';
import { UpdatePabellonDto } from './dto/update-pabellon.dto';

@Controller('pabellon')
export class PabellonController {
  constructor(private readonly pabellonService: PabellonService) {}

  @Post()
  create(@Body() createPabellonDto: CreatePabellonDto) {
    return this.pabellonService.create(createPabellonDto);
  }

  @Get()
  findAll() {
    return this.pabellonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pabellonService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePabellonDto: UpdatePabellonDto) {
    return this.pabellonService.update(id, updatePabellonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pabellonService.remove(id);
  }
}
