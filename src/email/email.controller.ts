import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { sendEmailDto } from './dto/sendEmailDto.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Post('send')
  async sendMail(@Body() dto: sendEmailDto) {
    return await this.emailService.sendEmail(dto);
    // return { message: 'Email sent successfully' };
  }
}
