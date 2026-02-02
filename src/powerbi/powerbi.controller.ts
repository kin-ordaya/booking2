import { Controller, Get, UseGuards } from '@nestjs/common';
import { PowerbiService } from './powerbi.service';
import { BasicAuthGuard } from 'src/auth/guard/basicAuth.guard';
import { ApiBasicAuth, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('powerbi')
export class PowerbiController {
  constructor(private readonly powerbiService: PowerbiService) {}

  @Get()
  @LogRequest()
  @ApiOperation({ 
    summary: 'Obtener datos de reservas para PowerBI',
    description: 'Este endpoint requiere autenticación Basic Auth. Click en "Authorize" e ingrese usuario y contraseña.' 
  })
  @ApiBasicAuth('basic-auth')
  @UseGuards(BasicAuthGuard)
  async getReservasData() {
    return this.powerbiService.getReservasData();
  }
}