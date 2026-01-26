import { Controller, Get, Delete, Query } from '@nestjs/common';
import { LogService } from './log.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetLogsDto } from './dto/get-log.dto';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @Roles('admin')
  async getLogs(@Query() getLogsDto: GetLogsDto) {
    return this.logService.getLogs(getLogsDto);
  }

  @Get('errors')
  @Roles('admin')
  async getErrorLogs(@Query() getLogsDto: GetLogsDto) {
    return this.logService.getErrorLogs(getLogsDto);
  }

  @Get('stats')
  @Roles('admin')
  async getLogStats() {
    return this.logService.getLogStats();
  }

  @Delete('cleanup')
  @Roles('admin')
  async cleanupOldLogs() {
    await this.logService.cleanupOldLogs(30);
    return { success: true, message: 'Old logs cleanup completed' };
  }

  @Delete()
  @Roles('admin')
  async clearLogs(@Query('type') type?: 'all' | 'app' | 'error') {
    return this.logService.clearLogs(type || 'all');
  }
}