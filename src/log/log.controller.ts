import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetLogsDto } from './dto/get-log.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';

@Controller('logs')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener logs',
    description: 'Obtener logs del sistema.',
  })
  async getLogs(@Query() getLogsDto: GetLogsDto) {
    return this.logService.getLogs(getLogsDto);
  }

  @Get('errors')
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener errores',
    description: 'Obtener errores del sistema.',
  })
  async getErrorLogs(@Query() getLogsDto: GetLogsDto) {
    return this.logService.getErrorLogs(getLogsDto);
  }

  @Get('stats')
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Obtener estadísticas',
    description: 'Obtener estadísticas del sistema.',
  })
  async getLogStats() {
    return this.logService.getLogStats();
  }

  @Delete('cleanup')
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Limpiar logs',
    description: 'Limpiar logs del sistema.',
  })
  async cleanupOldLogs() {
    await this.logService.cleanupOldLogs(30);
    return { success: true, message: 'Old logs cleanup completed' };
  }

  @Delete()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Limpiar logs',
    description: 'Limpiar logs del sistema.',
  })
  async clearLogs(@Query('type') type?: 'all' | 'app' | 'error') {
    return this.logService.clearLogs(type || 'all');
  }
}
