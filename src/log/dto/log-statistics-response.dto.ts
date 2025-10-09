// log/dto/log-statistics-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { LogEntryResponseDto } from './log-response.dto';

export class LogStatisticsResponseDto {
  @ApiProperty({ description: 'Total de logs analizados' })
  totalLogs: number;

  @ApiProperty({ 
    description: 'Conteo de logs por nivel',
    example: { 'error': 15, 'info': 120, 'warn': 8 }
  })
  levelCounts: { [key: string]: number };

  @ApiProperty({ 
    description: 'Últimos 10 errores encontrados',
    type: [LogEntryResponseDto] 
  })
  recentErrors: LogEntryResponseDto[];

  @ApiProperty({ description: 'Total de archivos de log' })
  totalFiles: number;

  static fromData(
    totalLogs: number,
    levelCounts: { [key: string]: number },
    recentErrors: any[],
    totalFiles: number
  ): LogStatisticsResponseDto {
    const response = new LogStatisticsResponseDto();
    response.totalLogs = totalLogs;
    response.levelCounts = levelCounts;
    response.recentErrors = recentErrors.map(log => 
      LogEntryResponseDto.fromLogEntry(log)
    );
    response.totalFiles = totalFiles;
    return response;
  }
}