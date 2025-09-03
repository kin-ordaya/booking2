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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('pabellon')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class PabellonController {
  constructor(private readonly pabellonService: PabellonService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createPabellonDto: CreatePabellonDto) {
    return this.pabellonService.create(createPabellonDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.pabellonService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.pabellonService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id') id: string,
    @Body() updatePabellonDto: UpdatePabellonDto,
  ) {
    return this.pabellonService.update(id, updatePabellonDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.pabellonService.remove(id);
  }
}
