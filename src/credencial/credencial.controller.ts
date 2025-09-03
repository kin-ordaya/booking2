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
  UseGuards,
} from '@nestjs/common';
import { CredencialService } from './credencial.service';
import { CreateCredencialDto } from './dto/create-credencial.dto';
import { UpdateCredencialDto } from './dto/update-credencial.dto';
import { PaginationCredencialDto } from './dto/pagination-credencial.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('credencial')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class CredencialController {
  constructor(private readonly credencialService: CredencialService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createCredencialDto: CreateCredencialDto) {
    return this.credencialService.create(createCredencialDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationCredencialDto: PaginationCredencialDto) {
    return this.credencialService.findAll(paginationCredencialDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.credencialService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateCredencialDto: UpdateCredencialDto,
  ) {
    return this.credencialService.update(id, updateCredencialDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.credencialService.remove(id);
  }
}
