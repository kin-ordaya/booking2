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
import { Responsable } from 'src/responsable/entities/responsable.entity';
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
    @InjectRepository(Responsable)
    private readonly responsableRepository: Repository<Responsable>,
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
        relations: [
          'recurso',
          'docente',
          'docente.usuario',
          'docente.rol',
          'clase'
        ],
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
      }

      // const responsable = await this.responsableRepository.findOne({
      //   where: { id: reserva.docente.usuario.id },
      //   relations: ['rol'],
      // });

      // 2. Obtener todos los detalles de reserva con sus credenciales
      const detallesReserva = await this.detalleReservaRepository.find({
        where: { reserva: { id } },
        relations: ['credencial', 'credencial.rol'],
      });

      // 3. Separar credenciales generales
      const credenciales = detallesReserva
        .filter((detalle) => detalle.credencial)
        .map((detalle) => ({
          usuario: detalle.credencial.usuario,
          clave: detalle.credencial.clave,
          tipo: detalle.credencial.rol?.nombre.toLowerCase() || 'general', // Usa el tipo real
        }));

      // 4. Filtrar por tipos específicos si es necesario
      const credencialesEstudiantes = credenciales.filter(
        (c) => c.tipo === 'estudiante',
      );
      const credencialesGenerales = credenciales.filter(
        (c) => c.tipo === 'general',
      );

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
          nrc: reserva.clase?.nrc,
          id: reserva.id,
          codigo: reserva.codigo,
          recurso: reserva.recurso.nombre,
          fechaInicio: reserva.inicio,
          fechaFin: reserva.fin,
        },
        credenciales: {
          estudiantes: credencialesEstudiantes,
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
    const reservaData = await this.getCredencialesReserva(reserva_id);

    // Formatear fecha
    const fechaInicio = new Date(reservaData.reserva.fechaInicio);
    const fechaFin = new Date(reservaData.reserva.fechaFin);

    const fechaHtml = `
      <p>
        - Fecha: ${fechaInicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
        - Horario: ${fechaInicio.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} - ${fechaFin.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
      </p>
    `;

    // Combinar todas las credenciales (estudiantes, generales y docentes)
    const todasLasCredenciales = [
      ...reservaData.credenciales.estudiantes,
      ...reservaData.credenciales.generales,
      ...reservaData.credenciales.docentes,
    ];

    const emailData = {
      recurso_nombre: reservaData.reserva.recurso,
      fecha_html: fechaHtml,
      credenciales: todasLasCredenciales
    };

    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: correo,
      subject: `Credenciales de acceso - ${reservaData.reserva.recurso} - ${reservaData.reserva.nrc}`,
      text: 'Credenciales de acceso',
      html: getReservaTemplate(emailData),
    };

    await transport.sendMail(options);
    return { message: 'Email enviado correctamente' };
  } catch (error) {
    console.error('Error al enviar mail:', error);
    throw error;
  }
}
}
