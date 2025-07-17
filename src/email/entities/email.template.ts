export const getReservaTemplate = (data: {
  recurso_nombre: string;
  fecha_html: string;
  credenciales: any[];
  credenciales_docente?: any[];
}) => {
  const { recurso_nombre, fecha_html, credenciales, credenciales_docente } = data;

  return `
  <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Correo de Acceso a ${recurso_nombre}</title>
    <style>
        /* Todos tus estilos CSS aquí */
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            background-color: #ccc;
        }
        h1 {
            color: #7D2181;
            text-align: center;
            margin-bottom: 20px;
        }
        p {
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: 1px solid #9b9b9b;
            border-radius: 10px;
        }
        th, td {
            border: 1px solid #9b9b9b;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
            color: #333;
        }
        td.correo {
            color: #7D2181;
            background-color: #f0f0f0;
        }
        td.clave {
            color: #333;
            background-color: #f0f0f0;
        }
        .firma {
            margin-top: 20px;
        }
        .firma p {
            margin-top: -10px;
            color: #000000;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bienvenido a ${recurso_nombre}</h1>
        
        <p>Estimado Docente,</p>
        <p>Nos complace informarle que su reserva ha sido confirmada.</p>
        
        ${fecha_html}
        
        <p>Agradecemos su preferencia y quedamos a su disposición para cualquier consulta adicional. 
        A continuación, encontrará la información de acceso a su cuenta en ${recurso_nombre}:</p>
        
        <div class="container">
            ${
              credenciales_docente
                ? `
                <h3>Credenciales del Docente:</h3>
                <table>
                    <tr><th>Correo</th><th>Clave</th></tr>
                    ${credenciales_docente
                      .map(
                        (c) => `
                        <tr>
                            <td class="correo">${c.usuario}</td>
                            <td class="clave">${c.clave}</td>
                        </tr>
                    `,
                      )
                      .join('')}
                </table>
                <h3>Credenciales de los Estudiantes:</h3>
            `
                : ''
            }
            
            <table>
                <tr>
                    ${
                      credenciales[0].usuario
                        ? '<th>Correo</th><th>Clave</th>'
                        : '<th>Código de activación</th>'
                    }
                </tr>
                ${credenciales
                  .map(
                    (credencial) => `
                    <tr>
                        ${
                          credencial.usuario
                            ? `
                            <td class="correo">${credencial.usuario}</td>
                            <td class="clave">${credencial.clave}</td>
                        `
                            : `
                            <td class="clave">${credencial.clave}</td>
                        `
                        }
                    </tr>
                `,
                  )
                  .join('')}
            </table>
            
            <p>Por favor, guarde esta información de manera segura y no la comparta con nadie.</p>
            <p>Gracias por utilizar nuestros servicios.</p>
        </div>
        
        <div class="firma">
            <img src="https://ucontinental.edu.pe/documentos/logo/crea-tu-propia-historia.gif" alt="Logo">
            <p style="font-weight: bold; font-size: 18px;">Recursos Académicos Virtuales</p>
            <p>Laboratorios y Talleres <br> +51 945 605752</p>
        </div>
    </div>
</body>
</html>
`;
};
