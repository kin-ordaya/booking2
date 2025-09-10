import { SendEmailDto } from './dto/sendEmailDto.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { getReservaTemplate } from './entities/email.template';
import { InjectRepository } from '@nestjs/typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Repository } from 'typeorm';
import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { SeccionEmail } from 'src/seccion_email/entities/seccion_email.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,
    @InjectRepository(DetalleReserva)
    private readonly detalleReservaRepository: Repository<DetalleReserva>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
    @InjectRepository(SeccionEmail)
    private readonly seccionEmailRepository: Repository<SeccionEmail>,
  ) {}

  emailTransport() {
    // console.log('Config SMTP:', {
    //   host: this.configService.get('EMAIL_HOST'),
    //   port: this.configService.get('EMAIL_PORT'),
    //   user: this.configService.get('EMAIL_USER'),
    // });
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
          'autor',
          'autor.usuario',
          'autor.rol',
          'clase',
        ],
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
      }

      // 2. Obtener TODOS los detalles de reserva con sus credenciales y roles
      const detallesReserva = await this.detalleReservaRepository.find({
        where: { reserva: { id } },
        relations: ['credencial', 'credencial.rol'],
      });

      // 3. Procesar todas las credenciales desde detalle_reserva
      const todasCredenciales = detallesReserva
        .filter((detalle) => detalle.credencial) // Filtrar detalles con credencial
        .map((detalle) => ({
          usuario: detalle.credencial.usuario,
          clave: detalle.credencial.clave,
          tipo: detalle.credencial.rol?.nombre.toLowerCase() || 'general',
        }));

      // 4. Separar por tipos (todos vienen de detalle_reserva)
      return {
        docente: {
          id: reserva.docente?.id,
          correo: reserva.docente?.usuario?.correo_institucional,
        },
        autor: {
          id: reserva.autor?.id,
          correo: reserva.autor?.usuario?.correo_institucional,
        },
        recurso: {
          id: reserva.recurso.id,
        },
        reserva: {
          nrc: reserva.clase?.nrc,
          id: reserva.id,
          mantenimiento: reserva.mantenimiento,
          codigo: reserva.codigo,
          recurso: reserva.recurso.nombre,
          fechaInicio: reserva.inicio,
          fechaFin: reserva.fin,
        },
        credenciales: {
          estudiantes: todasCredenciales.filter((c) => c.tipo === 'estudiante'),
          generales: todasCredenciales.filter((c) => c.tipo === 'general'),
          docentes: todasCredenciales.filter((c) => c.tipo === 'docente'),
        },
      };
    } catch (error) {
      console.error('Error al obtener credenciales: ', error);
      throw error;
    }
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    const { reserva_id } = sendEmailDto;
    const transport = this.emailTransport();

    try {
      const reservaData = await this.getCredencialesReserva(reserva_id);
      //console.log(reservaData);

      const recurso = await this.recursoRepository.findOne({
        where: { id: reservaData.recurso.id },
        select: ['id', 'nombre', 'link_guia', 'link_aula_virtual'],
      });

      if (!recurso) {
        throw new NotFoundException(
          `Recurso con ID ${reservaData.recurso.id} no encontrado`,
        );
      }

      let docente;
      let destinatario;

      if (reservaData.reserva.mantenimiento == 0) {
        if (reservaData.docente) {
          // console.log(' Mantenimiento 0 - Docente');
          docente = await this.rolUsuarioRepository.findOne({
            where: { id: reservaData.docente.id, rol: { nombre: 'DOCENTE' } },
            relations: ['usuario', 'rol'],
          });

          //console.log('Docente:', docente);

          if (!docente) {
            throw new NotFoundException(
              `Docente con ID ${reservaData.docente.id} no encontrado`,
            );
          }

          if (!docente.usuario.correo_institucional) {
            throw new NotFoundException(
              `Correo no configurado para el docente con ID ${reservaData.docente.correo}`,
            );
          }

          destinatario = docente.usuario.correo_institucional;
        } else {
          // console.log(' Mantenimiento 0 - Autor');
          destinatario = reservaData.autor.correo;
        }
      } else {
        // console.log(' Mantenimiento 1 - Autor');
        destinatario = reservaData.autor.correo;
      }
      // console.log('Destinatario:', destinatario);

      // Formatear fecha
      const fechaInicio = new Date(reservaData.reserva.fechaInicio);
      const fechaFin = new Date(reservaData.reserva.fechaFin);
      //TODO: Cambiar o configurar ya que resta 5 horas
      const fechaHtml = `
      <p>
        - Fecha: ${reservaData.reserva.fechaInicio.toDateString()}<br>
        - Horario: ${reservaData.reserva.fechaInicio.toDateString()} - ${reservaData.reserva.fechaFin.toDateString()}
      </p>
    `;

      // 3. Combinar todas las credenciales
      const todasLasCredenciales = [
        ...reservaData.credenciales.estudiantes,
        ...reservaData.credenciales.generales,
        ...reservaData.credenciales.docentes,
      ];

      // 4. Obtener secciones de email
      const seccionesEmail = await this.seccionEmailRepository.find({
        where: { recurso: { id: recurso.id } },
      });

      // 5. Preparar datos para el template
      const emailData = {
        recurso_nombre: recurso.nombre,
        fecha_html: fechaHtml,
        credenciales: todasLasCredenciales,
        link_guia: recurso.link_guia || undefined, // undefined será manejado en el template
        link_aula_virtual: recurso.link_aula_virtual || undefined,
        secciones_email: seccionesEmail.length > 0 ? seccionesEmail : undefined,
        esMantenimiento: reservaData.reserva.mantenimiento == 1,
      };

      let asunto = `Credenciales de acceso - ${recurso.nombre}`;
      if (reservaData.reserva.mantenimiento == 0 && reservaData.reserva.nrc) {
        asunto += ` - ${reservaData.reserva.nrc}`;
      }
      if (reservaData.reserva.mantenimiento == 1) {
        asunto = `Reserva de Mantenimiento - ${recurso.nombre}`;
      }

      // 6. Enviar email
      const options: nodemailer.SendMailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: destinatario,
        subject: asunto,
        html: getReservaTemplate(emailData),
      };

      await transport.sendMail(options);
      return { message: 'Email enviado correctamente' };
    } catch (error) {
      console.error('Error al enviar mail:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al enviar el correo');
    }
  }
}
