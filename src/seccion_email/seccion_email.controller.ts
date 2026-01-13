import { Controller, Post, Body } from '@nestjs/common';
import { SeccionEmailService } from './seccion_email.service';
import { CreateSeccionEmailDto } from './dto/create-seccion_email.dto';

@Controller('seccion-email')
export class SeccionEmailController {
  constructor(private readonly seccionEmailService: SeccionEmailService) {}

  @Post()
  create(@Body() createSeccionEmailDto: CreateSeccionEmailDto) {
    return this.seccionEmailService.create(createSeccionEmailDto);
  }
}
