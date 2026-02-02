import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/sendEmailDto.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { SendEmailGrupoDto } from './dto/sendEmailGrupo.dto';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('email')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @LogRequest()
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Enviar email',
    description: 'Enviar email del sistema.',
  })
  async sendMail(@Body() dto: SendEmailDto) {
    return await this.emailService.sendEmail(dto);
    // return { message: 'Email sent successfully' };
  }

  @Post('send-grupo')
  @Roles('ADMINISTRADOR', 'DOCENTE')
  @ApiOperation({
    summary: 'Enviar email grupo',
    description: 'Enviar email grupo del sistema.',
  })
  async sendMailGrupo(@Body() dto: SendEmailGrupoDto) {
    return await this.emailService.sendEmailGrupo(dto);
    // return { message: 'Emails for group sent successfully' };
  }
}
