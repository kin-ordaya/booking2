// config/pinoConfig.ts
import { Params } from 'nestjs-pino';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { join } from 'path';

export const CORRELATION_ID_HEADER = 'X-Correlation-Id';

export const pinoConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    transport: {
      targets: [
        // Consola para desarrollo
        {
          target: 'pino-pretty',
          level: 'debug',
          options: {
            messageKey: 'message',
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname,context',
            hideObject: true,
            singleLine: false,
          },
        },
        // Archivo principal con TODOS los logs
        {
          target: 'pino/file',
          level: 'debug',
          options: {
            destination: join(process.cwd(), 'logs', 'app.log'),
            mkdir: true,
          },
        },
        // Archivo SOLO para errores (nivel error y fatal)
        {
          target: 'pino/file',
          level: 'error', // Solo niveles 50 (error) y 60 (fatal)
          options: {
            destination: join(process.cwd(), 'logs', 'error.log'),
            mkdir: true,
          },
        },
      ],
    },

    messageKey: 'message',
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,

    genReqId: (req: Request, res: Response) => {
      const incomingCorrelationId = req.headers['x-correlation-id'] as string;
      const correlationId = incomingCorrelationId ?? randomUUID();

      req.headers['x-correlation-id'] = correlationId;
      res.setHeader('X-Correlation-Id', correlationId);

      return correlationId;
    },

    customProps: (req: Request) => {
      const userId = (req as any).userId || 'anonymous';
      const userRole = (req as any).userRole || 'anonymous';

      return {
        requestId: req.headers['x-correlation-id'],
        userAgent: req.headers['user-agent'],
        userId: userId,
        userRole: userRole,
        ip: req.ip,
        env: process.env.NODE_ENV,
      };
    },

    autoLogging: false,

    serializers: {
      req: (req) => {
        return {
          method: req.method,
          url: req.url,
          correlationId: req.headers['x-correlation-id'],
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        };
      },
      res: (res) => {
        return {
          statusCode: res.statusCode,
        };
      },
      err: (err) => {
        return {
          type: err.constructor.name,
          message: err.message,
          stack: err.stack,
        };
      },
    },
  },
};