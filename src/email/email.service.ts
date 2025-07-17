import { sendEmailDto } from './dto/sendEmailDto.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { getReservaTemplate } from './entities/email.template';
import { InjectRepository } from '@nestjs/typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Repository } from 'typeorm';
import { Credencial } from 'src/credencial/entities/credencial.entity';
import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,
    @InjectRepository(DetalleReserva)
    private readonly detalleReservaRepository: Repository<DetalleReserva>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
  ) {}

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

  async getCredencialesReserva(id: string) {
  try {
    // 1. Obtener la reserva con sus relaciones básicas
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: ['recurso', 'docente', 'docente.usuario', 'docente.rol'],
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    // 2. Obtener todos los detalles de reserva con sus credenciales
    const detallesReserva = await this.detalleReservaRepository.find({
      where: { reserva: { id } },
      relations: ['credencial', 'credencial.rol'],
    });

    // 3. Separar credenciales generales
    const credencialesGenerales = detallesReserva
      .filter(detalle => detalle.credencial)
      .map(detalle => ({
        usuario: detalle.credencial.usuario,
        clave: detalle.credencial.clave,
        tipo: 'general',
      }));

    // 4. Obtener credenciales docentes (con tipo explícito)
    let credencialesDocentes: Array<{ usuario?: string; clave: string; tipo: string }> = [];
    
    if (reserva.docente && reserva.docente.rol.nombre.toLowerCase() === 'docente') {
      const credencialesDocente = await this.credencialRepository.find({
        where: {
          rol: { id: reserva.docente.rol.id },
          recurso: { id: reserva.recurso.id }
        }
      });

      credencialesDocentes = credencialesDocente.map(credencial => ({
        usuario: credencial.usuario,
        clave: credencial.clave,
        tipo: 'docente',
      }));
    }

    return {
      reserva: {
        id: reserva.id,
        codigo: reserva.codigo,
        recurso: reserva.recurso.nombre,
        fechaInicio: reserva.inicio,
        fechaFin: reserva.fin,
      },
      credenciales: {
        generales: credencialesGenerales,
        docentes: credencialesDocentes,
      },
    };
  } catch (error) {
    throw new Error(`Error al obtener credenciales: ${error.message}`);
  }
}

  async sendEmail(dto: sendEmailDto) {
    const { reserva_id, correo } = dto;

    const transport = this.emailTransport();

    const testData = {
      recurso_nombre: 'Laboratorio de Prueba',
      fecha_html:
        '<p>- Fecha: 1 de enero de 2023<br>- Horario: 00:00 - 23:59</p>',
      credenciales: [
        {
          usuario: 'test@example.com',
          clave: 'test123',
        },
      ],
    };

    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: correo,
      subject: 'Credenciales de acceso',
      text: 'Credenciales de acceso',
      html: getReservaTemplate(testData),
    };
    try {
      // await transport.sendMail(options);
      return await this.getCredencialesReserva(reserva_id);
      console.log('Email sent successfully');
    } catch (error) {
      console.log('Error sending mail: ', error);
    }
  }
}
