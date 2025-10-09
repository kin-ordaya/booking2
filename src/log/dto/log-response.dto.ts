// log/dto/log-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LogEntryResponseDto {
  @ApiProperty({ description: 'Nivel numérico del log' })
  level: number;

  @ApiProperty({ description: 'Nombre del nivel del log' })
  levelName: string;

  @ApiProperty({ description: 'Mensaje del log' })
  message: string;

  @ApiProperty({ description: 'Timestamp del log en formato ISO' })
  timestamp: string;

  @ApiProperty({ description: 'Correlation ID', required: false })
  correlationId?: string;

  @ApiProperty({ description: 'IP del cliente', required: false })
  ip?: string;

  @ApiProperty({ description: 'User Agent', required: false })
  userAgent?: string;

  static fromLogEntry(entry: any): LogEntryResponseDto {
    const dto = new LogEntryResponseDto();
    dto.level = entry.level;
    dto.levelName = LogEntryResponseDto.getLevelName(entry.level);
    dto.message = entry.message;
    dto.timestamp = entry.timestamp;
    dto.correlationId = entry.correlationId || entry.requestId;
    dto.ip = entry.ip;
    dto.userAgent = entry.userAgent;
    return dto;
  }

  private static getLevelName(level: number): string {
    const levels: { [key: number]: string } = {
      10: 'trace',
      20: 'debug', 
      30: 'info',
      40: 'warn',
      50: 'error',
      60: 'fatal',
    };
    return levels[level] || 'unknown';
  }
}

export class LogsResponseDto {
  @ApiProperty({ type: [LogEntryResponseDto] })
  logs: LogEntryResponseDto[];

  @ApiProperty()
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  @ApiProperty()
  filters: {
    search?: string;
    level?: string;
    correlationId?: string;
    startDate?: string;
    endDate?: string;
  };

  static fromLogs(
    entries: any[], 
    page: number, 
    limit: number, 
    total: number,
    filters: any
  ): LogsResponseDto {
    const response = new LogsResponseDto();
    response.logs = entries.map(LogEntryResponseDto.fromLogEntry);
    response.pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    response.filters = filters;
    return response;
  }
}