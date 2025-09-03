import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponsableService } from './responsable.service';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('responsable')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ResponsableController {
  constructor(private readonly responsableService: ResponsableService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createResponsableDto: CreateResponsableDto) {
    return this.responsableService.create(createResponsableDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.responsableService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.responsableService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateResponsableDto: UpdateResponsableDto,
  // ) {
  //   return this.responsableService.update(id, updateResponsableDto);
  // }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.responsableService.remove(id);
  }
}
