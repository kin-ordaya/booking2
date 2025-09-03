import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/sendEmailDto.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('email')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Post('send')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  async sendMail(@Body() dto: SendEmailDto) {
    return await this.emailService.sendEmail(dto);
    // return { message: 'Email sent successfully' };
  }
}
