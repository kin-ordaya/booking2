import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CredencialService } from './credencial.service';
import { CreateCredencialDto } from './dto/create-credencial.dto';
import { UpdateCredencialDto } from './dto/update-credencial.dto';
import { PaginationCredencialDto } from './dto/pagination-credencial.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';

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
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.credencialService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateCredencialDto: UpdateCredencialDto,
  ) {
    return this.credencialService.update(id, updateCredencialDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.credencialService.remove(id);
  }
}
