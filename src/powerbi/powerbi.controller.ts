import { Controller, Get} from '@nestjs/common';
import { PowerbiService } from './powerbi.service';


@Controller('powerbi')
export class PowerbiController {
  constructor(private readonly powerbiService: PowerbiService) {}


  @Get()
  async getReservasData() {
    return this.powerbiService.getReservasData();
  }

}
