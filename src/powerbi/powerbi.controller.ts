import { Controller, Get, Headers, UseGuards} from '@nestjs/common';
import { PowerbiService } from './powerbi.service';
import { BasicAuthGuard} from 'src/auth/guard/basicAuth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';


@Controller('powerbi')
export class PowerbiController {
  constructor(private readonly powerbiService: PowerbiService) {}


  @Get()
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  async getReservasData(
  ) {
    return this.powerbiService.getReservasData();
  }

}
