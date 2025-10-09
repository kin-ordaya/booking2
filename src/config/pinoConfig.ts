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
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
        // Archivo principal SIN rotación automática
        {
          target: 'pino/file',
          level: 'debug',
          options: {
            destination: join(process.cwd(), 'logs', 'app.log'),
            // mkdir: true,
          },
        },
        // Archivo de errores separado
        {
          target: 'pino/file',
          level: 'error',
          options: {
            destination: join(process.cwd(), 'logs', 'error.log'),
            // mkdir: true,
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
      req[CORRELATION_ID_HEADER] = correlationId;
      res.setHeader('X-Correlation-Id', correlationId);
      
      return correlationId;
    },

    customProps: (req: Request) => {
      return {
        requestId: req.headers['x-correlation-id'],
        userAgent: req.headers['user-agent'],
        ip: req.ip,
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