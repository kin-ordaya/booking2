export const getReservaTemplate = (data: {
  recurso_nombre: string;
  fecha_html: string;
  credenciales: Array<{ usuario?: string; clave: string; tipo?: string }>;
}) => {
  const { recurso_nombre, fecha_html, credenciales } = data;

  // Verificar si hay al menos una credencial con usuario
  const hasUsuarios = credenciales.some(c => c.usuario);

  // Agrupar credenciales por tipo
  const credencialesPorTipo = credenciales.reduce((acc, credencial) => {
    const tipo = credencial.tipo || 'general';
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(credencial);
    return acc;
  }, {} as Record<string, typeof credenciales>);

  // Mapeo de nombres amigables para los tipos
  const nombresTipo: Record<string, string> = {
    general: 'Generales',
    estudiante: 'Estudiantes',
    docente: 'Docentes'
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
          ${creds.map(credencial => `
            <tr>
              ${hasUsuarios ? `<td>${credencial.usuario || '-'}</td>` : ''}
              <td>${credencial.clave}</td>
            </tr>
          `).join('')}
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
            line-height: 1.8;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f0f4f9;
        }

        header {
            background-color: #003366;
            color: white;
            padding: 1.5rem;
            text-align: center;
            border-bottom: 4px solid #000000;
        }

        header h2 {
            margin: 0;
            font-size: 2rem;
            letter-spacing: 1px;
        }

        .main {
            max-width: 900px;
            margin: 3rem auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        h3 {
            color: #003366;
            font-size: 1.4rem;
            margin-bottom: 0.5rem;
        }

        p {
            font-size: 1rem;
            margin: 1rem 0;
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
    </style>
</head>
<body>
  <header>
    <h2>CUENTAS RESERVADAS ${recurso_nombre}</h2>
  </header>
  
  <div class="main">
    <h3>Estimado docente</h3>
    <p>Es un gusto saludarlo. Agradecemos su interés en integrar los recursos de ${recurso_nombre} en su enseñanza. Esperamos que esta herramienta sea de gran apoyo en sus clases.</p>
    
    <p>Para ingresar al laboratorio de ${recurso_nombre} es necesario seguir los pasos de la siguiente guía de acceso, puede compartirla con sus estudiantes: 
    <a href="https://drive.google.com/file/d/1kaoRtXc40zJabjXpWDl-y5EAVRSvFggf/view?usp=sharing" target="_blank">Guía de Acceso</a>. 
    Es importante que se comunique a los estudiantes que no se debe introducir información personal a las cuentas de ${recurso_nombre}.</p>
    
    <p>El link de acceso al laboratorio de ${recurso_nombre} es el siguiente:
    <a href="https://aulavirtual.continental.edu.pe/course/view.php?id=35958">Laboratorio Algetec</a></p>
    
    <hr>
    
    <h3>Detalles de su reserva:</h3>
    <p><strong>Recurso:</strong> ${recurso_nombre}</p>
    ${fecha_html}
    
    <!-- Sección modificada para tablas dinámicas -->
    ${tablasCredenciales}
    
    <hr>
    
    <h3>Advertencia:</h3>
    <img class="warning" src="https://res.cloudinary.com/dpjoocxnd/image/upload/v1738082065/WhatsApp_Image_2025-01-28_at_10.56.57_AM_rpifkg.jpg" alt="Advertencia de seguridad">
    <p>Si tiene alguna consulta adicional no dude en contactarse con nosotros. Saludos.</p>
    
    <h4>Quedo atento a sus dudas y comentarios. Saludos</h4>

    <div class="signature">
       <img src="https://ucontinental.edu.pe/documentos/logo/firma-generador.gif" alt="Logo Universidad Continental">
    </div>

    <div class="contact-info">
        <h2><strong>Pamela Xiomara Verastegui Paucar</strong></h2>
        <p>Laboratorios y Talleres de Especialidad</p>
        <p>Recursos Académicos Virtuales</p>
        <p>Técnica RAV Gestión de Recursos</p>
        <p>Teléfono: +51 989149427</p>
        <p>Email: <a href="mailto:pverastegui@continental.edu.pe">pverastegui@continental.edu.pe</a></p>
    </div>
  </div>

  <footer>
    &copy; Universidad Continental - Todos los derechos reservados, 2025
  </footer>
</body>
</html>
  `;
};