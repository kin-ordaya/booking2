import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';

@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Post()
  create(@Body() createCampusDto: CreateCampusDto) {
    return this.campusService.create(createCampusDto);
  }

  @Get()
  findAll() {
    return this.campusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.campusService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updateCampusDto: UpdateCampusDto,
  ) {
    return this.campusService.update(id, updateCampusDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.campusService.remove(id);
  }
}
