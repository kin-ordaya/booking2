import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeccionEmailService } from './seccion_email.service';
import { CreateSeccionEmailDto } from './dto/create-seccion_email.dto';
import { UpdateSeccionEmailDto } from './dto/update-seccion_email.dto';

@Controller('seccion-email')
export class SeccionEmailController {
  constructor(private readonly seccionEmailService: SeccionEmailService) {}

  @Post()
  create(@Body() createSeccionEmailDto: CreateSeccionEmailDto) {
    return this.seccionEmailService.create(createSeccionEmailDto);
  }

  @Get()
  findAll() {
    return this.seccionEmailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seccionEmailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeccionEmailDto: UpdateSeccionEmailDto) {
    return this.seccionEmailService.update(+id, updateSeccionEmailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seccionEmailService.remove(+id);
  }
}
