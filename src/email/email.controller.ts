import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/sendEmailDto.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Post('send')
  async sendMail(@Body() dto: SendEmailDto) {
    return await this.emailService.sendEmail(dto);
    // return { message: 'Email sent successfully' };
  }
}
