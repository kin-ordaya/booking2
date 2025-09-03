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
import { EapService } from './eap.service';
import { CreateEapDto } from './dto/create-eap.dto';
import { UpdateEapDto } from './dto/update-eap.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('eap')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class EapController {
  constructor(private readonly eapService: EapService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createEapDto: CreateEapDto) {
    return this.eapService.create(createEapDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.eapService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eapService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateEapDto: UpdateEapDto,
  ) {
    return this.eapService.update(id, updateEapDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eapService.remove(id);
  }
}
