export const getReservaTemplate = (data: {
  recurso_nombre: string;
  fecha_html: string;
  credenciales: Array<{ usuario?: string; clave: string; tipo?: string }>;
  link_guia?: string; // Nuevo campo opcional
  link_aula_virtual?: string; // Nuevo campo opcional
  secciones_email?: Array<{
    // Nuevo campo para las secciones
    asunto: 'ADVERTENCIA' | 'INFORMACION' | 'INSTRUCCION';
    link?: string;
  }>;
}) => {
  const {
    recurso_nombre,
    fecha_html,
    credenciales,
    link_guia,
    link_aula_virtual,
    secciones_email = [],
  } = data;

  // Verificar si hay al menos una credencial con usuario
  const hasUsuarios = credenciales.some((c) => c.usuario);

  // Agrupar credenciales por tipo
  const credencialesPorTipo = credenciales.reduce(
    (acc, credencial) => {
      const tipo = credencial.tipo || 'general';
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(credencial);
      return acc;
    },
    {} as Record<string, typeof credenciales>,
  );

  // Mapeo de nombres amigables para los tipos
  const nombresTipo: Record<string, string> = {
    general: 'Generales',
    estudiante: 'Estudiantes',
    docente: 'Docentes',
  };

  // Generar las tablas dinámicas
  const tablasCredenciales = Object.entries(credencialesPorTipo)
    .map(([tipo, creds]) => {
      if (creds.length === 0) return '';

      return `
        <h3>Credenciales ${nombresTipo[tipo] || tipo}</h3>
        <table>
          <tr>
            ${hasUsuarios ? '<th>Usuario</th>' : ''}
            <th>Clave</th>
          </tr>
          ${creds
            .map(
              (credencial) => `
            <tr>
              ${hasUsuarios ? `<td>${credencial.usuario || '-'}</td>` : ''}
              <td>${credencial.clave}</td>
            </tr>
          `,
            )
            .join('')}
        </table>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cuentas Reservadas - ALGETEC CIENCIAS BÁSICAS</title>
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f0f4f9;
        }

        header {
            background-color: #003366;
            color: white;
            padding: 1rem;
            text-align: center;
            border-bottom: 4px solid #000000;
        }

        header h2 {
            margin: 0;
            font-size: 1.8rem;
            letter-spacing: 1px;
        }

        .main {
            max-width: 900px;
            margin: 1.5rem auto;
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        h3 {
            color: #003366;
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
            margin-top: 1rem;
        }

        p {
            font-size: 1rem;
            margin: 0.75rem 0;
        }

        .contact-section {
            background-image: url('https://ci3.googleusercontent.com/meips/ADKq_NYx_0gGy7T1Ql8GUhjO1lETjwTX-7G_TlgfbgzBNOUS0O4tQQiqYb0YBIRqvEUp-yB367VoZ_rVREYCa_iHOpSkN7Fou2sQreHsTuxujA0RT4leigZJeel-BG9DOXs=s0-d-e1-ft#https://img.freepik.com/vector-gratis/fondo-oscuro-grunge_1048-11745.jpg');
            background-size: cover;
            background-position: 50% 50%;
            padding: 20px 15px; /* Reducido de 30px */
            color: white;
            box-sizing: border-box;
            max-width: 100%;
            margin: 0px auto;
        }

        .contact-section h3 {
            color: white !important; /* Forzar color blanco */
            margin-top: 0.5rem;
        }

        .contact-section a {
            color: white !important; /* Forzar color blanco */
            text-decoration: none;
        }

        .contact-section a:hover {
            text-decoration: underline;
        }

        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem; /* Reducido espaciado */
        }

        .contact-icon {
            width: 30px;
            height: 30px;
            margin-right: 0.75rem; /* Reducido de 1rem */
        }

        .contact-details {
            border: 1px solid white;
            border-radius: 8px; /* Reducido de 10px */
            padding: 8px; /* Reducido de 10px */
            flex: 1;
        }

        footer {
            margin-top: 1.5rem; /* Reducido de 3rem */
            background-color: #003366;
            color: white;
            padding: 0.75rem; /* Reducido de 1rem */
            text-align: center;
            border-radius: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2rem;
            font-size: 0.95rem;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        th, td {
            text-align: left;
            padding: 0.75rem;
            border: 1px solid #ddd;
            font-size: 1rem;
        }

        th {
            background: #003366;
            color: white;
            text-transform: uppercase;
            font-weight: bold;
        }

        tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        tbody tr:hover {
            background-color: #e6f2ff;
        }

        footer {
            margin-top: 3rem;
            background-color: #003366;
            color: white;
            padding: 1rem;
            text-align: center;
            border-radius: 8px;
        }

        .signature img {
            margin-left: -2rem;
            width: 400px;
            height: auto;
            margin-bottom: -1rem;
        }

        .titulo {
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .signature img {
            width: 300px;
            height: auto;
            margin-bottom: 0.025rem;
        }

        .contact-info p {
            font-size: 0.75rem;
            margin: 0.025rem 0;
        }

        .contact-info h2 {
            font-size: 1rem;
            margin-bottom: 0.025rem;
        }

        .contact-info a {
            color: #007bff;
            text-decoration: none;
        }

        .contact-info a:hover {
            text-decoration: underline;
        }

        a {
            color: #003366;
            text-decoration: none;
            font-weight: bold;
        }
        
        .warning {
           width: 600px;
            height: auto;
            margin-bottom: 0.025rem;
        }

        a:hover {
            text-decoration: underline;
        }

        hr {
            border: 0;
            height: 1px;
            background-color: #ddd;
            margin: 1.5rem 0;
        }

        @media (max-width: 768px) {
            .signature {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .contact-info {
                margin-left: 0;
            }
            
            .warning {
                width: 100%;
            }
        }

        .seccion-email {
          margin: 1.5rem 0;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .seccion-email.advertencia {
          background-color: #fff3f3;
          border-left-color: #ff6b6b;
        }

        .seccion-email.informacion {
          background-color: #f0f7ff;
          border-left-color: #4dabf7;
        }

        .seccion-email.instruccion {
          background-color: #f8f9fa;
          border-left-color: #adb5bd;
        }

        .seccion-image {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
          border-radius: 4px;
        }
          
    </style>
</head>
<body>
  <header>
    <h2>CUENTAS RESERVADAS ${recurso_nombre}</h2>
  </header>
  <div class="main">
    <h3 style="margin-top: 0;">Estimado docente</h3>
    <p>Es un gusto saludarlo. Agradecemos su interés en integrar los recursos de ${recurso_nombre} en su enseñanza. Esperamos que esta herramienta sea de gran apoyo en sus clases.</p>
    ${
      link_guia
        ? `
    <p>Para ingresar al laboratorio de ${recurso_nombre} es necesario seguir los pasos de la siguiente guía de acceso, puede compartirla con sus estudiantes: 
    <a href="${link_guia}" target="_blank">Guía de Acceso</a>. 
    Es importante que se comunique a los estudiantes que no se debe introducir información personal a las cuentas de ${recurso_nombre}.</p>
    `
        : ''
    }
    
    ${
      link_aula_virtual
        ? `
    <p>El link de acceso al laboratorio de ${recurso_nombre} es el siguiente:
    <a href="${link_aula_virtual}">Laboratorio</a></p>
    `
        : ''
    }

    <hr style="margin: 1rem 0;">
    
    <h3>Detalles de su reserva:</h3>
    <p><strong>Recurso:</strong> ${recurso_nombre}</p>
    ${fecha_html}

    <p>
      <img
        data-emoji="📌"
        class="an1"
        alt="📌"
        aria-label="📌"
        draggable="false"
        src="https://fonts.gstatic.com/s/e/notoemoji/16.0/1f4cc/32.png"
        loading="lazy"
      /><strong>Importante:</strong>Le recordamos que, según
      el <strong>Reglamento Interno de LT-UC</strong>, el acceso
      de los estudiantes debe realizarse exclusivamente en el
      horario reservado.
    </p>

    <hr style="margin: 1rem 0;">
    
    <!-- Sección modificada para tablas dinámicas -->
    ${tablasCredenciales}

    <hr style="margin: 1rem 0;">
    
    ${
      secciones_email.length > 0
        ? `
    <!-- Secciones de email dinámicas -->
    ${secciones_email
      .map(
        (seccion) => `
      <div class="seccion-email ${seccion.asunto.toLowerCase()}">
        <h3>${seccion.asunto}:</h3>
        ${seccion.link ? `<img src="${seccion.link}" alt="${seccion.asunto}" class="seccion-image">` : ''}
        <!-- Aquí podrías agregar más contenido si expandes la entidad SeccionEmail -->
      </div>
    `,
      )
      .join('')}
    `
        : ''
    }
    
    <h4>Quedamos atentos a sus dudas y comentarios. Saludos</h4>
<div
            style="
              background-image: url('https://ci3.googleusercontent.com/meips/ADKq_NYx_0gGy7T1Ql8GUhjO1lETjwTX-7G_TlgfbgzBNOUS0O4tQQiqYb0YBIRqvEUp-yB367VoZ_rVREYCa_iHOpSkN7Fou2sQreHsTuxujA0RT4leigZJeel-BG9DOXs=s0-d-e1-ft#https://img.freepik.com/vector-gratis/fondo-oscuro-grunge_1048-11745.jpg');
              background-size: cover;
              background-position: 50% 50%;
              padding: 30px 15px;
              color: white;
              box-sizing: border-box;
              max-width: 100%;
              margin: 0px auto;
            "
          >
            <div
              style="
                width: 1646px;
                height: 0px;
                background-color: rgba(0, 0, 0, 0.5);
              "
            ></div>
            <div style="display: flex">
              <div style="min-width: 250px; padding: 15px">
                <p style="margin-bottom: 10px">
                  <font face="tahoma, sans-serif" size="4"
                    >Se
                    <span
                      zeum4c22="PR_3_0"
                      data-ddnwab="PR_3_0"
                      aria-invalid="grammar"
                      class="Lm ng"
                      >pone</span
                    >
                    a disposición los siguientes documentos: Matriz de
                    requisitos del servicio, Reglamento Interno LT y Ficha de
                    Sugerencias, Quejas y Reclamos.</font
                  >
                </p>
                <p style="margin-bottom: 10px">
                  <font face="tahoma, sans-serif" size="4"
                    >El Código QR deberá ser compartido con los
                    estudiantes.</font
                  >
                </p>
                <div style="text-align: center">
                  <font face="tahoma, sans-serif" size="4"
                    ><img
                      src="https://ci3.googleusercontent.com/meips/ADKq_NbFoUyqungO0ptxRp3TkGxitI1sIl0H5KFvriK6hEn0q32r0vrqzuHufFumt5kjDm436lVKxcj18sGqKGRWIlAWbQ_-vaXtzgE62FPR8CUfOl1_y7MpXinC7s1C52BoRIG_Gx2Lg2PzaegZy0gynhBZPwJ4-iWXkCLiBZV1IW3_7ute9bVqHZ7ZsoRrmxG3jleizw=s0-d-e1-ft#https://res.cloudinary.com/dpjoocxnd/image/upload/v1739478280/QR-_Doc._Soporte_e_Informaci%C3%B3n_del_servicio_1_1_f7brlr.jpg"
                      alt="QR"
                      style="outline: 0px; width: 240px; max-width: 15rem"
                      class="gmail_canned_response_image"
                  /></font>
                </div>
              </div>
              <div style="min-width: 250px;">
                <h3 style="margin-top: 10px; color: white !important;">
                  <font face="tahoma, sans-serif" size="4"
                    >Reservas y Uso de Laboratorios</font
                  >
                </h3>
                <ul style="list-style: none; padding: 0px; margin: 0px">
                  <li style="margin-left: 15px; margin-bottom: 10px">
                    <font face="tahoma, sans-serif" size="4"
                      >Las reservas y uso de los laboratorios de cómputo
                      realizarlas con programación académica y <a
                        href="mailto:mesadeayuda@continental.edu.pe"
                        style="color: white; text-decoration-line: none"
                        target="_blank"
                        >mesadeayuda@continental.edu.<wbr />pe</a
                      >.</font
                    >
                  </li>
                  <li style="margin-left: 15px; margin-bottom: 10px">
                    <font face="tahoma, sans-serif" size="4"
                      >Para el FabLab coordinar con <a
                        href="mailto:cerrons@continental.edu.pe"
                        style="color: white; text-decoration-line: none"
                        target="_blank"
                        >jcerrons@continental.edu.<wbr />pe</a
                      >.</font
                    >
                  </li>
                </ul>
                <h3 style="margin-bottom: 8px; color: white !important;">
                  <font face="tahoma, sans-serif" size="4"
                    >Agenda de Números de Contacto</font
                  >
                </h3>
                <ul style="list-style: none; padding: 0px; margin: 0px">
                  <div style="display: flex">
                    <div>
                      <font face="tahoma, sans-serif" size="4"
                        ><img
                          src="https://ci3.googleusercontent.com/meips/ADKq_Nb9pYFIvwXDqLiZDHQZ2w8tjvEXzh8Yf0IRsKZf3sJIRbVoJ2VyWf3mFs-ueAOSkVxjyuphja48zccUpqtfHsQWLsWrAjpV8J6zSWVPF9IRZia3CAIGUZ6n7fxIitnEETE=s0-d-e1-ft#https://res.cloudinary.com/dpjoocxnd/image/upload/v1742306467/ti_nwkcvv.png"
                          alt=""
                          style="height: 30px; width: 30px; margin-right: 1rem"
                          class="gmail_canned_response_image"
                      /></font>
                    </div>
                    <div
                      style="
                        border: 1px solid rgb(255, 255, 255);
                        border-radius: 10px;
                        padding: 10px;
                        margin-left: 10px;
                      "
                    >
                      <li style="margin-left: 15px">
                        <font face="tahoma, sans-serif" size="4"
                          >Soporte de TI - 964 565 922</font
                        >
                      </li>
                    </div>
                  </div>
                  <div style="display: flex">
                    <div>
                      <font face="tahoma, sans-serif" size="4"
                        ><img
                          src="https://ci3.googleusercontent.com/meips/ADKq_NbZu-vpfmDXYdf9CxMsG7uJDOZJ-KMtNA2yvg4hppfmiaFSR8OgxcsbsDUvEgHGWC3TU5FiQTmrYsk9ya9N_yXD5K--fOTMmo9VWpv8uYubKsc66RhLfo45tscArGeTjXHgdQ=s0-d-e1-ft#https://res.cloudinary.com/dpjoocxnd/image/upload/v1742306467/Boss_k7dgjh.png"
                          alt=""
                          style="height: 30px; width: 30px; margin-right: 1rem"
                          class="gmail_canned_response_image"
                      /></font>
                    </div>
                    <div
                      style="
                        border: 1px solid rgb(255, 255, 255);
                        border-radius: 10px;
                        padding: 10px;
                        margin-left: 10px;
                      "
                    >
                      <li style="margin-left: 15px">
                        <font face="tahoma, sans-serif" size="4"
                          >Jefatura de Laboratorios y Talleres - Guillermo
                          Jaramillo – 957952394</font
                        >
                      </li>
                    </div>
                  </div>
                  <div style="display: flex">
                    <div>
                      <font face="tahoma, sans-serif" size="4"
                        ><img
                          src="https://ci3.googleusercontent.com/meips/ADKq_NYof8_HDpFhLiJPnxHrrx0GfvPau6Y5U3WzFoZX0x7TDLtOcwUuoGw41GAMdI6TQCjfPBCeseRkaeRSUCMrQzQnIHXJiG-NqMw_lwKd7Q-I9tdH0JuPL4rNPH0JvDn2QyJ3qfw9AM7CEw=s0-d-e1-ft#https://res.cloudinary.com/dpjoocxnd/image/upload/v1742306468/Supervisor_bkr0mo.png"
                          alt=""
                          style="height: 30px; width: 30px; margin-right: 1rem"
                          class="gmail_canned_response_image"
                      /></font>
                    </div>
                    <div
                      style="
                        border: 1px solid rgb(255, 255, 255);
                        border-radius: 10px;
                        padding: 10px;
                        margin-left: 10px;
                      "
                    >
                      <li style="margin-left: 15px">
                        <font face="tahoma, sans-serif" size="4"
                          >Supervisión de Recursos Académicos Virtuales –
                          Nicolás Espinoza - 945605752</font
                        >
                      </li>
                    </div>
                  </div>
                  <div style="display: flex">
                    <div>
                      <font face="tahoma, sans-serif" size="4"
                        ><img
                          src="https://ci3.googleusercontent.com/meips/ADKq_NZe0KpgWe3UV8Gtpj675BtXz1-CxkTYWQ2K9AZk5omh_L0zvuMVWEgV2bXCt5m2QiO5oPSDTawERhodPHyoSyqd45IHH2R630WLpexI0Q3RRfujJWl5kgffGIwfehe4h4vosQ7CXTzyt77VdB4=s0-d-e1-ft#https://res.cloudinary.com/dpjoocxnd/image/upload/v1742306467/Inclusi%C3%B3n_mox3ny.png"
                          alt=""
                          style="height: 30px; width: 30px; margin-right: 1rem"
                          class="gmail_canned_response_image"
                      /></font>
                    </div>
                    <div
                      style="
                        border: 1px solid rgb(255, 255, 255);
                        border-radius: 10px;
                        padding: 10px;
                        margin-left: 10px;
                      "
                    >
                      <li style="margin-left: 15px">
                        <font face="tahoma, sans-serif" size="4"
                          >Unidad de inclusión de estudiantes con discapacidad -
                          Lourdes Suasnabar - 943328906 - <a
                            href="mailto:lsuasnabar@continental.edu.pe"
                            style="color: white; text-decoration-line: none"
                            target="_blank"
                            >lsuasnabar@continental.edu.<wbr />pe</a
                          ></font
                        >
                      </li>
                    </div>
                  </div>
                </ul>
              </div>
            </div>
            <div
              style="
                text-align: center;
                margin-top: 1rem;
                color: rgb(204, 204, 204);
              "
            >
              <font face="tahoma, sans-serif" size="4"
                >© 2025 Universidad Continental - Todos los derechos
                reservados.</font
              >
            </div>
          </div>
  </div>

  <footer>
    &copy; Universidad Continental - Todos los derechos reservados, 2025
  </footer>
</body>
</html>
  `;
};
