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
        .filter((detalle) => detalle.credencial)
        .map((detalle) => ({
          usuario: detalle.credencial.usuario,
          clave: detalle.credencial.clave,
          tipo: 'general',
        }));

      // 4. Obtener credenciales docentes (con tipo explícito)
      let credencialesDocentes: Array<{
        usuario?: string;
        clave: string;
        tipo: string;
      }> = [];

      if (
        reserva.docente &&
        reserva.docente.rol.nombre.toLowerCase() === 'docente'
      ) {
        const credencialesDocente = await this.credencialRepository.find({
          where: {
            rol: { id: reserva.docente.rol.id },
            recurso: { id: reserva.recurso.id },
          },
        });

        credencialesDocentes = credencialesDocente.map((credencial) => ({
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
      console.log('Error al obtener credenciales: ', error);
      throw error;
    }
  }

  async sendEmail(dto: sendEmailDto) {
    const { reserva_id, correo } = dto;
    const transport = this.emailTransport();

    try {
      // Obtener los datos reales de la reserva y credenciales
      const reservaData = await this.getCredencialesReserva(reserva_id);

      // Formatear la fecha para el email
      const fechaInicio = new Date(reservaData.reserva.fechaInicio);
      const fechaFin = new Date(reservaData.reserva.fechaFin);

      const fechaHtml = `
      <p>
        - Fecha: ${fechaInicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
        - Horario: ${fechaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${fechaFin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </p>
    `;

      // Combinar todas las credenciales (generales + docentes)
      const todasLasCredenciales = [
        ...reservaData.credenciales.generales,
        ...reservaData.credenciales.docentes,
      ];

      const emailData = {
        recurso_nombre: reservaData.reserva.recurso,
        fecha_html: fechaHtml,
        credenciales: todasLasCredenciales.map((c) => ({
          usuario: c.usuario,
          clave: c.clave,
          tipo: c.tipo, // Puedes usar este campo en el template si necesitas diferenciar
        })),
      };

      const options: nodemailer.SendMailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: correo,
        subject: `Credenciales de acceso - ${reservaData.reserva.recurso}`,
        text: 'Credenciales de acceso',
        html: getReservaTemplate(emailData), // Asegúrate que tu template pueda manejar estos datos
      };

      // Enviar el email (descomenta esta línea cuando estés listo para enviar emails reales)
      await transport.sendMail(options);
      console.log('Email sent successfully');

      return { message: 'Email enviado correctamente', data: reservaData };
    } catch (error) {
      console.log('Error al enviar mail: ', error);
      throw error;
    }
  }
}
