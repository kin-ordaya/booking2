import { sendEmailDto } from './dto/sendEmailDto.dto';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { getReservationTemplate } from './entities/email.template';
@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  emailTransport() {
    console.log('Config SMTP:', {
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      user: this.configService.get('EMAIL_USER'),
    });
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    return transporter;
  }

  async sendEmail(dto: sendEmailDto) {
    const { recipients} = dto;

    const transport = this.emailTransport();

    const testData = {
      recursoNombre: 'Laboratorio de Prueba',
      fechaHTML:
        '<p>- Fecha: 1 de enero de 2023<br>- Horario: 00:00 - 23:59</p>',
      credenciales: [
        {
          credencial_usuario: 'test@example.com',
          credencial_contrasena: 'test123',
        },
      ],
    };
    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: recipients,
      subject: 'Credenciales de acceso',
      text: 'Credenciales de acceso',
      html: getReservationTemplate(testData),
    };
    try {
      await transport.sendMail(options);
      console.log('Email sent successfully');
    } catch (error) {
      console.log('Error sending mail: ', error);
    }
  }
}
