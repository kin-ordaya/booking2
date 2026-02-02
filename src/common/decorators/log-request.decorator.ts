import { SetMetadata, applyDecorators, UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

export const LOG_REQUEST_KEY = 'log_request';
export const LogRequest = (options?: { level?: 'info' | 'debug' }) => {
  return applyDecorators(
    SetMetadata(LOG_REQUEST_KEY, options || { level: 'info' }),
    UseInterceptors(LoggingInterceptor),
  );
};