// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { NextFunction, Request, Response } from 'express';
// import { randomUUID } from 'crypto';

// export const CORRELATION_ID_HEADER = 'X-Correlation-Id';

// // Extensión correcta para TypeScript
// declare module 'express' {
//   interface Request {
//     [CORRELATION_ID_HEADER]?: string;
//   }
// }

// @Injectable()
// export class CorrelationIdMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     // Usa el header existente o genera uno nuevo
//     const id = req.headers[CORRELATION_ID_HEADER.toLowerCase()] as string || randomUUID();

//     // Asigna al request para que Pino lo capture
//     req[CORRELATION_ID_HEADER] = id;

//     // Establece en los headers de respuesta
//     res.setHeader(CORRELATION_ID_HEADER, id);

//     // 👇 LOG PARA DEBUG - remueve después de verificar
//     console.log(`🆔 Correlation ID generado: ${id}`);

//     next();
//   }
// }
