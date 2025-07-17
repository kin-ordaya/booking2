export const getReservationTemplate = (data: {
  recursoNombre: string;
  fechaHTML: string;
  credenciales: any[];
  credencialesDocente?: any[];
}) => {
  const { recursoNombre, fechaHTML, credenciales, credencialesDocente } = data;

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Correo de Acceso a ${recursoNombre}</title>
    <style>
        /* Todos tus estilos CSS aquí */
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        /* ... resto de tus estilos ... */
    </style>
</head>
<body>
    <div class="container">
        <h1>Bienvenido a ${recursoNombre}</h1>
        
        <p>Estimado Docente,</p>
        <p>Nos complace informarle que su reserva ha sido confirmada.</p>
        
        ${fechaHTML}
        
        <p>Agradecemos su preferencia y quedamos a su disposición para cualquier consulta adicional. 
        A continuación, encontrará la información de acceso a su cuenta en ${recursoNombre}:</p>
        
        <div class="container">
            ${credencialesDocente ? `
                <h3>Credenciales del Docente:</h3>
                <table>
                    <tr><th>Correo</th><th>Contraseña</th></tr>
                    ${credencialesDocente.map(c => `
                        <tr>
                            <td class="correo">${c.credencial_usuario}</td>
                            <td class="contraseña">${c.credencial_contrasena}</td>
                        </tr>
                    `).join('')}
                </table>
                <h3>Credenciales de los Estudiantes:</h3>
            ` : ''}
            
            <table>
                <tr>
                    ${credenciales[0].credencial_usuario ? 
                      '<th>Correo</th><th>Contraseña</th>' : 
                      '<th>Código de activación</th>'}
                </tr>
                ${credenciales.map(credencial => `
                    <tr>
                        ${credencial.credencial_usuario ? `
                            <td class="correo">${credencial.credencial_usuario}</td>
                            <td class="contraseña">${credencial.credencial_contrasena}</td>
                        ` : `
                            <td class="contraseña">${credencial.credencial_contrasena}</td>
                        `}
                    </tr>
                `).join('')}
            </table>
            
            <p>Por favor, guarde esta información de manera segura y no la comparta con nadie.</p>
            <p>Gracias por utilizar nuestros servicios.</p>
        </div>
        
        <div class="Firma">
            <img src="https://ucontinental.edu.pe/documentos/logo/crea-tu-propia-historia.gif" alt="Logo">
            <p style="font-weight: bold; font-size: 18px;">Recursos Académicos Virtuales</p>
            <p>Laboratorios y Talleres <br> +51 945 605752</p>
        </div>
    </div>
</body>
</html> `;
                }