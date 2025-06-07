import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CredencialService } from './credencial.service';
import { CreateCredencialDto } from './dto/create-credencial.dto';
import { UpdateCredencialDto } from './dto/update-credencial.dto';
import { PaginationCredencialDto } from './dto/pagination-credencial.dto';
import { plainToClass } from 'class-transformer';

@Controller('credencial')
export class CredencialController {
  constructor(private readonly credencialService: CredencialService) {}

  @Post()
  create(@Body() createCredencialDto: CreateCredencialDto) {
    return this.credencialService.create(createCredencialDto);
  }

  @Get()
  findAll(@Query() paginationCredencialDto: PaginationCredencialDto) {
    return this.credencialService.findAll(paginationCredencialDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.credencialService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCredencialDto: UpdateCredencialDto,
  ) {
    const updateDto = plainToClass(UpdateCredencialDto, updateCredencialDto, {
      excludeExtraneousValues: true,
    });
    return this.credencialService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.credencialService.remove(id);
  }
}
