import { Roles } from '@/auth/decorators/roles.decorator';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Enpoint para verificar el estado de la aplicación',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-12-01T10:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'production' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV'),
    };
  }

  @Get('ready')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Readiness check endpoint',
    description:
      'Endpoint para verificar si la aplicación está lista para recibir tráfico',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to receive traffic',
  })
  getReadiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Liveness check endpoint',
    description: 'Endpoint para verificar si la aplicación está funcionando',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
  })
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
