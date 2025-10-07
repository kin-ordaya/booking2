// log/log.service.ts
import { GetLogsDto } from './dto/get-log.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';
import { readdir, readFile, stat } from 'fs/promises';
import { LogsResponseDto } from './dto/log-response.dto';
import { LogStatisticsResponseDto } from './dto/log-statistics-response.dto';

// Mover la interfaz a un archivo separado o hacerla interna con tipo any
interface InternalLogEntry {
  level: number;
  time: number;
  pid: number;
  hostname: string;
  message: string;
  correlationId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  [key: string]: any;
}

@Injectable()
export class LogService {
  private readonly logsDir = join(process.cwd(), 'logs');

  async getLogs(getLogsDto: GetLogsDto): Promise<LogsResponseDto> {
    try {
      const page = getLogsDto.page ?? 1;
      const limit = getLogsDto.limit ?? 50;
      const { search, level, correlationId, startDate, endDate, order } = getLogsDto;

      const skip = (page - 1) * limit;

      const files = await this.getLogFiles();
      let allLogs: InternalLogEntry[] = [];

      for (const file of files) {
        const fileLogs = await this.readLogFile(file);
        allLogs = [...allLogs, ...fileLogs];
      }

      allLogs.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return order === 'desc' ? timeB - timeA : timeA - timeB;
      });

      let filteredLogs = allLogs;

      if (level) {
        filteredLogs = filteredLogs.filter(
          (log) => this.getLevelName(log.level) === level.toLowerCase(),
        );
      }

      if (correlationId) {
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.correlationId?.includes(correlationId) ||
            log.requestId?.includes(correlationId),
        );
      }

      if (search) {
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.message?.toLowerCase().includes(search.toLowerCase()) ||
            JSON.stringify(log).toLowerCase().includes(search.toLowerCase()),
        );
      }

      if (startDate) {
        const start = new Date(startDate);
        filteredLogs = filteredLogs.filter(
          (log) => new Date(log.timestamp) >= start,
        );
      }

      if (endDate) {
        const end = new Date(endDate);
        filteredLogs = filteredLogs.filter(
          (log) => new Date(log.timestamp) <= end,
        );
      }

      const total = filteredLogs.length;
      const paginatedLogs = filteredLogs.slice(skip, skip + limit);

      const filters = {
        search: search || undefined,
        level: level || undefined,
        correlationId: correlationId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      return LogsResponseDto.fromLogs(paginatedLogs, page, limit, total, filters);
    } catch (error) {
      throw new BadRequestException('Error al leer los logs');
    }
  }

  async getLogFiles(): Promise<string[]> {
    try {
      const files = await readdir(this.logsDir);
      return files
        .filter((file) => file.endsWith('.log'))
        .map((file) => join(this.logsDir, file))
        .sort()
        .reverse();
    } catch (error) {
      return [];
    }
  }

  private async readLogFile(filePath: string): Promise<InternalLogEntry[]> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      return lines
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((log): log is InternalLogEntry => log !== null);
    } catch (error) {
      return [];
    }
  }

  private getLevelName(level: number): string {
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

  async cleanupLogs(daysToKeep: number = 30): Promise<{ deletedCount: number; message: string }> {
    try {
      const files = await this.getLogFiles();
      const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        const fileStat = await stat(file);
        if (fileStat.mtimeMs < cutoffTime) {
          deletedCount++;
        }
      }

      return {
        deletedCount,
        message: `Se eliminarían ${deletedCount} archivos de log antiguos (manteniendo ${daysToKeep} días)`,
      };
    } catch (error) {
      throw new BadRequestException('Error al limpiar logs');
    }
  }

  async getLogStatistics(): Promise<LogStatisticsResponseDto> {
    try {
      const files = await this.getLogFiles();
      let totalLogs = 0;
      const levelCounts: { [key: string]: number } = {};
      const recentErrors: InternalLogEntry[] = [];

      for (const file of files.slice(0, 5)) {
        const logs = await this.readLogFile(file);
        totalLogs += logs.length;

        logs.forEach((log) => {
          const level = this.getLevelName(log.level);
          levelCounts[level] = (levelCounts[level] || 0) + 1;

          if (level === 'error' && recentErrors.length < 10) {
            recentErrors.push(log);
          }
        });
      }

      return LogStatisticsResponseDto.fromData(
        totalLogs,
        levelCounts,
        recentErrors,
        files.length
      );
    } catch (error) {
      throw new BadRequestException('Error al generar estadísticas de logs');
    }
  }
}