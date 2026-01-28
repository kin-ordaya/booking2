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
import { In, Repository } from 'typeorm';
import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { SeccionEmail } from 'src/seccion_email/entities/seccion_email.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { SendEmailGrupoDto } from './dto/sendEmailGrupo.dto';
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
          'recurso.responsable',
          'recurso.responsable.rolUsuario',
          'recurso.responsable.rolUsuario.usuario',
          'docente',
          'docente.usuario',
          'docente.rol',
          'autor',
          'autor.usuario',
          'autor.rol',
          'clase',
          'clase.cursoModalidad',
          'clase.cursoModalidad.curso',
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

      // 4. Obtener responsable del recurso (si existe)
      const responsableRecurso =
        reserva.recurso.responsable?.[0]?.rolUsuario?.usuario;

      // 5. Obtener nombre del curso
      const nombreCurso = reserva.clase?.cursoModalidad?.curso?.nombre;

      // 4. Separar por tipos (todos vienen de detalle_reserva)
      return {
        docente: {
          id: reserva.docente?.id,
          correo: reserva.docente?.usuario?.correo_institucional,
          nombres: reserva.docente?.usuario?.nombres,
          apellidos: reserva.docente?.usuario?.apellidos,
        },
        autor: {
          id: reserva.autor?.id,
          correo: reserva.autor?.usuario?.correo_institucional,
        },
        recurso: {
          id: reserva.recurso.id,
        },
        responsable: responsableRecurso
          ? {
              id: responsableRecurso.id,
              nombres: responsableRecurso.nombres,
              apellidos: responsableRecurso.apellidos,
              correo: responsableRecurso.correo_institucional,
              telefono_institucional: responsableRecurso.telefono_institucional,
            }
          : null,
        curso: nombreCurso
          ? {
              nombre: nombreCurso,
            }
          : null,
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
      throw error;
    }
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    const { reserva_id } = sendEmailDto;
    const transport = this.emailTransport();

    try {
      const reservaData = await this.getCredencialesReserva(reserva_id);

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
      let autor;
      let destinatarioPrincipal;
      const destinatariosSecundarios: string[] = [];

      if (reservaData.reserva.mantenimiento == 0) {
        if (reservaData.docente) {
          docente = await this.rolUsuarioRepository.findOne({
            where: { id: reservaData.docente.id, rol: { nombre: 'DOCENTE' } },
            relations: ['usuario', 'rol'],
          });

          autor = await this.rolUsuarioRepository.findOne({
            where: {
              id: reservaData.autor.id,
            },
            relations: ['usuario'],
          });

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

          if (!autor) {
            throw new NotFoundException(
              `Autor con ID ${reservaData.autor.id} no encontrado`,
            );
          }

          if (!autor.usuario.correo_institucional) {
            throw new NotFoundException(
              `Correo no configurado para el autor con ID ${reservaData.autor.correo}`,
            );
          }

          destinatarioPrincipal = docente.usuario.correo_institucional;
          destinatariosSecundarios.push(autor.usuario.correo_institucional);
        } else {
          destinatarioPrincipal = reservaData.autor.correo;
        }
      } else {
        destinatarioPrincipal = reservaData.autor.correo;
      }
      destinatariosSecundarios.push('nespinoza@continental.edu.pe');


      destinatariosSecundarios.push(reservaData.responsable?.correo || '');

      const fechaInicio = new Date(reservaData.reserva.fechaInicio);
      const fechaFin = new Date(reservaData.reserva.fechaFin);

      const opcionesFecha: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      };
      const opcionesHora: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      };

      const fechaHtml = `
        <p>
          - Fecha: ${fechaInicio.toLocaleDateString('es-ES', opcionesFecha)}<br>
          - Horario: ${fechaInicio.toLocaleTimeString('es-ES', opcionesHora)} - ${fechaFin.toLocaleTimeString('es-ES', opcionesHora)}
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
        reserva_codigo: reservaData.reserva.codigo,
        recurso_id: recurso.id,
        recurso_nombre: recurso.nombre,
        curso_nombre: reservaData.curso?.nombre || undefined,
        docente_nombres:
          reservaData.docente?.nombres +
            ', ' +
            reservaData.docente?.apellidos || undefined,
        nrc: reservaData.reserva.nrc || undefined,
        fecha_html: fechaHtml,
        credenciales: todasLasCredenciales,
        link_guia: recurso.link_guia || undefined, // undefined será manejado en el template
        link_aula_virtual: recurso.link_aula_virtual || undefined,
        secciones_email: seccionesEmail.length > 0 ? seccionesEmail : undefined,
        esMantenimiento: reservaData.reserva.mantenimiento == 1,
        responsable_nombres: reservaData.responsable
          ? reservaData.responsable?.nombres +
            ', ' +
            reservaData.responsable?.apellidos
          : undefined,
        responsable_correo: reservaData.responsable
          ? reservaData.responsable?.correo
          : undefined,
        responsable_telefono: reservaData.responsable
          ? reservaData.responsable?.telefono_institucional
          : undefined,
      };

      let asunto = `Credenciales de acceso - ${recurso.nombre}`;
      if (reservaData.reserva.mantenimiento == 0 && reservaData.reserva.nrc) {
        asunto += ` - ${reservaData.reserva.nrc} - ${reservaData.curso?.nombre}`;
      }
      if (reservaData.reserva.mantenimiento == 1) {
        asunto = `Reserva de Mantenimiento - ${recurso.nombre}`;
      }

      // 6. Enviar email
      const options: nodemailer.SendMailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: destinatarioPrincipal,
        cc: destinatariosSecundarios?.join(', '),
        subject: asunto,
        html: getReservaTemplate(emailData),
      };

      await transport.sendMail(options);
      return { message: 'Email enviado correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al enviar el correo');
    }
  }

  async getReservasPorGrupo(grupoReservaId: string) {
    try {
      // Obtener todas las reservas del grupo
      const reservas = await this.reservaRepository.find({
        where: { grupo_reserva: { id: grupoReservaId } },
        relations: [
          'recurso',
          'recurso.responsable',
          'recurso.responsable.rolUsuario',
          'recurso.responsable.rolUsuario.usuario',
          'docente',
          'docente.usuario',
          'docente.rol',
          'autor',
          'autor.usuario',
          'autor.rol',
          'clase',
          'clase.cursoModalidad',
          'clase.cursoModalidad.curso',
        ],
        order: { inicio: 'ASC' }, // Ordenar por fecha de inicio
      });

      if (!reservas || reservas.length === 0) {
        throw new NotFoundException(
          `No se encontraron reservas con grupo_reserva_id ${grupoReservaId}`,
        );
      }

      // Procesar cada reserva para obtener sus credenciales
      const reservasConCredenciales = await Promise.all(
        reservas.map(async (reserva) => {
          // Obtener detalles de reserva con credenciales
          const detallesReserva = await this.detalleReservaRepository.find({
            where: { reserva: { id: reserva.id } },
            relations: ['credencial', 'credencial.rol'],
          });

          const todasCredenciales = detallesReserva
            .filter((detalle) => detalle.credencial)
            .map((detalle) => ({
              usuario: detalle.credencial.usuario,
              clave: detalle.credencial.clave,
              tipo: detalle.credencial.rol?.nombre.toLowerCase() || 'general',
            }));

          const responsableRecurso =
            reserva.recurso.responsable?.[0]?.rolUsuario?.usuario;

          const nombreCurso = reserva.clase?.cursoModalidad?.curso?.nombre;

          return {
            docente: {
              id: reserva.docente?.id,
              correo: reserva.docente?.usuario?.correo_institucional,
              nombres: reserva.docente?.usuario?.nombres,
              apellidos: reserva.docente?.usuario?.apellidos,
            },
            autor: {
              id: reserva.autor?.id,
              correo: reserva.autor?.usuario?.correo_institucional,
            },
            recurso: {
              id: reserva.recurso.id,
            },
            responsable: responsableRecurso
              ? {
                  id: responsableRecurso.id,
                  nombres: responsableRecurso.nombres,
                  apellidos: responsableRecurso.apellidos,
                  correo: responsableRecurso.correo_institucional,
                  telefono_institucional:
                    responsableRecurso.telefono_institucional,
                }
              : null,
            curso: nombreCurso
              ? {
                  nombre: nombreCurso,
                }
              : null,
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
              estudiantes: todasCredenciales.filter(
                (c) => c.tipo === 'estudiante',
              ),
              generales: todasCredenciales.filter((c) => c.tipo === 'general'),
              docentes: todasCredenciales.filter((c) => c.tipo === 'docente'),
            },
          };
        }),
      );

      // Verificar que todas las reservas sean del mismo recurso, docente, etc.
      const primerRecursoId = reservasConCredenciales[0].recurso.id;
      const mismasCondiciones = reservasConCredenciales.every(
        (reserva) =>
          reserva.recurso.id === primerRecursoId &&
          reserva.docente?.id === reservasConCredenciales[0].docente?.id,
      );

      if (!mismasCondiciones) {
        throw new Error(
          'Las reservas del grupo no tienen las mismas condiciones',
        );
      }

      // Combinar todas las credenciales únicas
      const todasCredencialesUnidas = {
        estudiantes: [
          ...new Map(
            reservasConCredenciales
              .flatMap((r) => r.credenciales.estudiantes)
              .map((item) => [item.usuario, item]),
          ).values(),
        ],
        generales: [
          ...new Map(
            reservasConCredenciales
              .flatMap((r) => r.credenciales.generales)
              .map((item) => [item.usuario, item]),
          ).values(),
        ],
        docentes: [
          ...new Map(
            reservasConCredenciales
              .flatMap((r) => r.credenciales.docentes)
              .map((item) => [item.usuario, item]),
          ).values(),
        ],
      };

      return {
        ...reservasConCredenciales[0], // Datos comunes (docente, autor, recurso, etc.)
        reservas: reservasConCredenciales.map((r) => r.reserva), // Array de reservas
        credenciales: todasCredencialesUnidas, // Credenciales combinadas
      };
    } catch (error) {
      throw error;
    }
  }

  async sendEmailGrupo(sendEmailGrupoDto: SendEmailGrupoDto) {
    const { grupo_reserva_id } = sendEmailGrupoDto;
    const transport = this.emailTransport();

    try {
      // 1. Obtener todas las reservas del grupo
      const reservas = await this.reservaRepository.find({
        where: {
          // Ajusta según tu estructura de entidad
          grupo_reserva: { id: grupo_reserva_id },
        },
        relations: [
          'recurso',
          'recurso.responsable',
          'recurso.responsable.rolUsuario',
          'recurso.responsable.rolUsuario.usuario',
          'docente',
          'docente.usuario',
          'docente.rol',
          'autor',
          'autor.usuario',
          'autor.rol',
          'clase',
          'clase.cursoModalidad',
          'clase.cursoModalidad.curso',
        ],
        order: { inicio: 'ASC' }, // Ordenar por fecha
      });

      if (!reservas || reservas.length === 0) {
        throw new NotFoundException(
          `No se encontraron reservas con grupo_reserva_id ${grupo_reserva_id}`,
        );
      }

      // 2. Tomar la primera reserva como referencia (todas deben tener los mismos datos básicos)
      const primeraReserva = reservas[0];

      // 3. Obtener TODOS los detalles de reserva de todas las reservas
      const detallesReservaIds = reservas.map((r) => r.id);
      const detallesReserva = await this.detalleReservaRepository.find({
        where: { reserva: { id: In(detallesReservaIds) } },
        relations: ['credencial', 'credencial.rol'],
      });

      // 4. Procesar todas las credenciales únicas
      const todasCredenciales = detallesReserva
        .filter((detalle) => detalle.credencial)
        .map((detalle) => ({
          usuario: detalle.credencial.usuario,
          clave: detalle.credencial.clave,
          tipo: detalle.credencial.rol?.nombre.toLowerCase() || 'general',
        }));

      // 5. Eliminar duplicados (usuario único)
      const credencialesUnicas = [
        ...new Map(
          todasCredenciales.map((item) => [item.usuario, item]),
        ).values(),
      ];

      // 6. Separar por tipos
      const credencialesPorTipo = {
        estudiantes: credencialesUnicas.filter((c) => c.tipo === 'estudiante'),
        generales: credencialesUnicas.filter((c) => c.tipo === 'general'),
        docentes: credencialesUnicas.filter((c) => c.tipo === 'docente'),
      };

      // 7. Obtener datos del recurso
      const recurso = await this.recursoRepository.findOne({
        where: { id: primeraReserva.recurso.id },
        select: ['id', 'nombre', 'link_guia', 'link_aula_virtual'],
      });

      if (!recurso) {
        throw new NotFoundException(
          `Recurso con ID ${primeraReserva.recurso.id} no encontrado`,
        );
      }

      // 8. Obtener datos comunes
      const responsableRecurso =
        primeraReserva.recurso.responsable?.[0]?.rolUsuario?.usuario;

      const nombreCurso = primeraReserva.clase?.cursoModalidad?.curso?.nombre;

      // 9. Determinar destinatarios (igual que en sendEmail)
      let docente;
      let autor;
      let destinatarioPrincipal;
      const destinatariosSecundarios: string[] = [];

      if (primeraReserva.mantenimiento == 0) {
        if (primeraReserva.docente) {
          docente = await this.rolUsuarioRepository.findOne({
            where: {
              id: primeraReserva.docente.id,
              rol: { nombre: 'DOCENTE' },
            },
            relations: ['usuario', 'rol'],
          });

          autor = await this.rolUsuarioRepository.findOne({
            where: { id: primeraReserva.autor.id },
            relations: ['usuario'],
          });

          if (!docente) {
            throw new NotFoundException(
              `Docente con ID ${primeraReserva.docente.id} no encontrado`,
            );
          }

          if (!docente.usuario.correo_institucional) {
            throw new NotFoundException(
              `Correo no configurado para el docente`,
            );
          }

          if (!autor) {
            throw new NotFoundException(
              `Autor con ID ${primeraReserva.autor.id} no encontrado`,
            );
          }

          if (!autor.usuario.correo_institucional) {
            throw new NotFoundException(`Correo no configurado para el autor`);
          }

          destinatarioPrincipal = docente.usuario.correo_institucional;
          destinatariosSecundarios.push(autor.usuario.correo_institucional);
        } else {
          destinatarioPrincipal =
            primeraReserva.autor.usuario.correo_institucional;
        }
      } else {
        destinatarioPrincipal =
          primeraReserva.autor.usuario.correo_institucional;
      }

      destinatariosSecundarios.push('nespinoza@continental.edu.pe');

      if (responsableRecurso?.correo_institucional) {
        destinatariosSecundarios.push(responsableRecurso.correo_institucional);
      }

      // 10. Generar HTML con TODAS las fechas
      const opcionesFecha: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      };
      const opcionesHora: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      };

      // Crear lista HTML con todas las fechas
      let fechaHtml = '<ul style="margin-left: 20px; padding-left: 0;">';
      reservas.forEach((reserva, index) => {
        const fechaInicio = new Date(reserva.inicio);
        const fechaFin = new Date(reserva.fin);

        fechaHtml += `
        <li style="margin-bottom: 10px;">
          <strong>Sesión ${index + 1}:</strong><br>
          • Fecha: ${fechaInicio.toLocaleDateString('es-ES', opcionesFecha)}<br>
          • Horario: ${fechaInicio.toLocaleTimeString('es-ES', opcionesHora)} - ${fechaFin.toLocaleTimeString('es-ES', opcionesHora)}
        </li>
      `;
      });
      fechaHtml += '</ul>';

      // 11. Obtener secciones de email
      const seccionesEmail = await this.seccionEmailRepository.find({
        where: { recurso: { id: recurso.id } },
      });

      // 12. Preparar datos para el template
      const emailData = {
        reserva_codigo: primeraReserva.codigo,
        recurso_id: recurso.id,
        recurso_nombre: recurso.nombre,
        curso_nombre: nombreCurso || undefined,
        docente_nombres: primeraReserva.docente
          ? `${primeraReserva.docente.usuario.nombres}, ${primeraReserva.docente.usuario.apellidos}`
          : undefined,
        nrc: primeraReserva.clase?.nrc || undefined,
        fecha_html: fechaHtml,
        credenciales: credencialesPorTipo.estudiantes.concat(
          credencialesPorTipo.generales,
          credencialesPorTipo.docentes,
        ),
        link_guia: recurso.link_guia || undefined,
        link_aula_virtual: recurso.link_aula_virtual || undefined,
        secciones_email: seccionesEmail.length > 0 ? seccionesEmail : undefined,
        esMantenimiento: primeraReserva.mantenimiento == 1,
        responsable_nombres: responsableRecurso
          ? `${responsableRecurso.nombres}, ${responsableRecurso.apellidos}`
          : undefined,
        responsable_correo:
          responsableRecurso?.correo_institucional || undefined,
        responsable_telefono:
          responsableRecurso?.telefono_institucional || undefined,
        esGrupoReserva: true,
        cantidad_reservas: reservas.length,
      };

      // 13. Crear asunto
      let asunto = `Credenciales de acceso - ${recurso.nombre}`;
      if (primeraReserva.mantenimiento == 0 && primeraReserva.clase?.nrc) {
        asunto += ` - ${primeraReserva.clase.nrc} - ${nombreCurso || ''}`;
      }
      if (primeraReserva.mantenimiento == 1) {
        asunto = `Reserva de Mantenimiento - ${recurso.nombre}`;
      }
      if (reservas.length > 1) {
        asunto += ` (${reservas.length} sesiones)`;
      }

      // 14. Enviar UN SOLO email con todas las fechas
      const options: nodemailer.SendMailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: destinatarioPrincipal,
        cc: destinatariosSecundarios.filter((email) => email).join(', '), // Filtrar emails vacíos
        subject: asunto,
        html: getReservaTemplate(emailData),
      };

      await transport.sendMail(options);

      return {
        message: 'Email enviado correctamente',
        // cantidad_reservas: reservas.length,
        // destinatario_principal: destinatarioPrincipal,
        // destinatarios_cc: destinatariosSecundarios
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al enviar el correo del grupo',
      );
    }
  }
}
