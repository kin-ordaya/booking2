import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EapService } from './eap.service';
import { CreateEapDto } from './dto/create-eap.dto';
import { UpdateEapDto } from './dto/update-eap.dto';

@Controller('eap')
export class EapController {
  constructor(private readonly eapService: EapService) {}

  @Post()
  create(@Body() createEapDto: CreateEapDto) {
    return this.eapService.create(createEapDto);
  }

  @Get()
  findAll() {
    return this.eapService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eapService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEapDto: UpdateEapDto) {
    return this.eapService.update(+id, updateEapDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eapService.remove(+id);
  }
}
