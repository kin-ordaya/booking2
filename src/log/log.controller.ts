// log/log.controller.ts
import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { GetLogsDto } from './dto/get-log.dto';
import { LogsResponseDto } from './dto/log-response.dto';
import { LogStatisticsResponseDto } from './dto/log-statistics-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @Roles('admin')
  async getLogs(@Query() getLogsDto: GetLogsDto): Promise<LogsResponseDto> {
    return this.logService.getLogs(getLogsDto);
  }

  @Get('statistics')
  @Roles('admin')
  async getLogStatistics(): Promise<LogStatisticsResponseDto> {
    return this.logService.getLogStatistics();
  }

  @Delete('cleanup')
  @Roles('admin')
  async cleanupLogs(@Query('daysToKeep') daysToKeep: number = 30) {
    return this.logService.cleanupLogs(daysToKeep);
  }
}