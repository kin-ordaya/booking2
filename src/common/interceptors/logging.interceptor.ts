import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { LOG_REQUEST_KEY } from '../decorators/log-request.decorator';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: PinoLogger,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Verificar si el endpoint tiene el decorador @LogRequest
    const logOptions = this.reflector.get<{ level: 'info' | 'debug' }>(
      LOG_REQUEST_KEY,
      context.getHandler(),
    );

    // Si no tiene el decorador, no hacer logging
    if (!logOptions) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, url, body } = request;

    const startTime = Date.now();
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const logLevel = logOptions.level || 'info';

    // Usar el nivel especificado en el decorador
    const logMethod =
      logLevel === 'debug'
        ? this.logger.debug.bind(this.logger)
        : this.logger.info.bind(this.logger);

    // Log del inicio de la request
    logMethod(
      {
        type: 'request_start',
        method,
        url: this.sanitizeUrl(url),
        controller: controllerName,
        handler: handlerName,
        body: this.sanitizeBody(body),
        timestamp: new Date().toISOString(),
      },
      `[${method}] ${url} - Iniciando`,
    );

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;

        // Log exitoso
        logMethod(
          {
            type: 'request_success',
            method,
            url,
            statusCode: response.statusCode,
            controller: controllerName,
            handler: handlerName,
            duration,
            timestamp: new Date().toISOString(),
          },
          `[${method}] ${url} - Completado (${duration}ms)`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        // Los errores siempre se loggean con error level
        this.logger.error(
          {
            type: 'request_error',
            method,
            url,
            statusCode,
            controller: controllerName,
            handler: handlerName,
            duration,
            error: {
              name: error.constructor.name,
              message: error.message,
              stack:
                this.config.get('NODE_ENV') === 'development'
                  ? error.stack
                  : undefined,
            },
            timestamp: new Date().toISOString(),
          },
          `[${method}] ${url} - Error (${duration}ms): ${error.message}`,
          error,
        );

        return throwError(() => error);
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    // Remover campos sensibles
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'creditCard',
      'cvv',
      'idToken',
    ];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  private sanitizeUrl(url: string): string {
    // Remover tokens de autenticación de URLs
    return url.replace(/\/auth\/[^\/]+\/(token|refresh)/, '/auth/***/***');
  }
}
