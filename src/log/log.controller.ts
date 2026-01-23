import { Controller, Get, Delete, Query } from '@nestjs/common';
import { LogService } from './log.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetLogsDto } from './dto/get-log.dto';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @Roles('admin')
  async getLogs(@Query() getLogsDto: GetLogsDto): Promise<any> {
    return this.logService.getLogs(getLogsDto);
  }

}
