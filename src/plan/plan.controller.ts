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
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AtLeastOneFieldPipe } from 'src/common/pipe/at-least-one-field.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('plan')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll() {
    return this.planService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new AtLeastOneFieldPipe()) updatePlanDto: UpdatePlanDto,
  ) {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.planService.remove(id);
  }
}
