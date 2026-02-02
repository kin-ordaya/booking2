import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SeccionEmailService } from './seccion_email.service';
import { CreateSeccionEmailDto } from './dto/create-seccion_email.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('seccion-email')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class SeccionEmailController {
  constructor(private readonly seccionEmailService: SeccionEmailService) {}

  @Post()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear sección de email',
    description: 'Crear una sección de email del sistema.',
  })
  create(@Body() createSeccionEmailDto: CreateSeccionEmailDto) {
    return this.seccionEmailService.create(createSeccionEmailDto);
  }
}
