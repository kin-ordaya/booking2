import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { readdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { GetLogsDto } from './dto/get-log.dto';

interface LogEntry {
  timestamp: string;
  level: number;
  message: string;
  correlationId?: string;
  requestId?: string;
  [key: string]: any;
}

@Injectable()
export class LogService {
  private readonly logsDir = join(process.cwd(), 'logs');
  private readonly appLogFile = join(this.logsDir, 'app.log');
  private readonly errorLogFile = join(this.logsDir, 'error.log');
  private readonly logger = new Logger(LogService.name);

  async getLogs(getLogsDto: GetLogsDto): Promise<any> {
    try {
      const page = getLogsDto.page ?? 1;
      const limit = Math.min(getLogsDto.limit ?? 50, 1000);
      const { search, level, correlationId, startDate, endDate, order } =
        getLogsDto;

      const skip = (page - 1) * limit;

      // Leer ambos archivos: primero app.log, luego error.log
      const appLogs = await this.readLogFile(this.appLogFile);
      const errorLogs = await this.readLogFile(this.errorLogFile);
      
      // Combinar logs, error.log podría tener duplicados pero están filtrados por nivel
      let allLogs = [...appLogs];
      
      // Si estamos filtrando por niveles de error, incluir también error.log
      if (!level || ['error', 'fatal'].includes(level.toLowerCase())) {
        allLogs = [...allLogs, ...errorLogs];
      }

      // Eliminar duplicados basados en timestamp + message (opcional)
      const uniqueLogs = this.removeDuplicates(allLogs);

      // Ordenar
      uniqueLogs.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return order === 'desc' ? timeB - timeA : timeA - timeB;
      });

      // Aplicar filtros
      let filteredLogs = this.applyFilters(uniqueLogs, {
        search,
        level,
        correlationId,
        startDate,
        endDate,
      });

      const total = filteredLogs.length;
      const paginatedLogs = filteredLogs.slice(skip, skip + limit);

      return {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: page > 1,
        },
        filters: {
          search: search || undefined,
          level: level || undefined,
          correlationId: correlationId || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        sources: {
          appLogCount: appLogs.length,
          errorLogCount: errorLogs.length,
          uniqueLogsCount: uniqueLogs.length,
        }
      };
    } catch (error) {
      this.logger.error(`Error getting logs: ${error.message}`);
      throw error;
    }
  }

  async getErrorLogs(getLogsDto: GetLogsDto): Promise<any> {
    try {
      // Versión específica solo para errores
      const errorLogs = await this.readLogFile(this.errorLogFile);
      
      // Ordenar
      errorLogs.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return getLogsDto.order === 'desc' ? timeB - timeA : timeA - timeB;
      });

      // Filtrar solo errores y fatales (aunque error.log ya los tiene)
      const filtered = errorLogs.filter(log => log.level >= 50);

      // Paginar
      const page = getLogsDto.page ?? 1;
      const limit = Math.min(getLogsDto.limit ?? 50, 1000);
      const skip = (page - 1) * limit;
      const paginated = filtered.slice(skip, skip + limit);

      return {
        logs: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
        type: 'errors-only'
      };
    } catch (error) {
      this.logger.error(`Error getting error logs: ${error.message}`);
      throw error;
    }
  }

  private removeDuplicates(logs: LogEntry[]): LogEntry[] {
    const seen = new Set();
    return logs.filter(log => {
      const key = `${log.timestamp}-${log.message}-${log.level}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private applyFilters(
    logs: LogEntry[],
    filters: {
      search?: string;
      level?: string;
      correlationId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): LogEntry[] {
    let filtered = [...logs];

    if (filters.level) {
      const levelNum = this.getLevelNumber(filters.level);
      if (levelNum !== undefined) {
        filtered = filtered.filter((log) => log.level === levelNum);
      }
    }

    if (filters.correlationId) {
      const searchId = filters.correlationId.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.correlationId?.toLowerCase().includes(searchId) ||
          log.requestId?.toLowerCase().includes(searchId),
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((log) => {
        if (log.message?.toLowerCase().includes(searchTerm)) return true;
        
        // Buscar en otras propiedades relevantes
        const stringified = JSON.stringify(log).toLowerCase();
        return stringified.includes(searchTerm);
      });
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter((log) => new Date(log.timestamp) <= end);
    }

    return filtered;
  }

  private async readLogFile(filePath: string): Promise<LogEntry[]> {
    try {
      if (!existsSync(filePath)) {
        return [];
      }

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
        .filter((log): log is LogEntry => log !== null);
    } catch (error) {
      this.logger.error(`Error reading log file ${filePath}: ${error.message}`);
      return [];
    }
  }

  async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      if (!existsSync(this.logsDir)) {
        return;
      }

      const files = await readdir(this.logsDir);
      const now = new Date().getTime();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      for (const file of files) {
        // NO borrar los archivos actuales de logs
        if (file === 'app.log' || file === 'error.log') continue;

        const filePath = join(this.logsDir, file);
        const stats = await stat(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > maxAge && file.endsWith('.log')) {
          await unlink(filePath);
          this.logger.log(`Deleted old log file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error cleaning up old logs: ${error.message}`);
    }
  }

  async clearLogs(type?: 'all' | 'app' | 'error'): Promise<{ success: boolean; message: string }> {
    try {
      if (type === 'all' || type === 'app') {
        if (existsSync(this.appLogFile)) {
          await writeFile(this.appLogFile, '');
          this.logger.log('App logs cleared');
        }
      }

      if (type === 'all' || type === 'error') {
        if (existsSync(this.errorLogFile)) {
          await writeFile(this.errorLogFile, '');
          this.logger.log('Error logs cleared');
        }
      }

      return { 
        success: true, 
        message: type ? `${type} logs cleared` : 'All logs cleared' 
      };
    } catch (error) {
      this.logger.error(`Error clearing logs: ${error.message}`);
      throw error;
    }
  }

  async getLogStats(): Promise<any> {
    try {
      const appLogs = existsSync(this.appLogFile) 
        ? await this.readLogFile(this.appLogFile) 
        : [];
      const errorLogs = existsSync(this.errorLogFile) 
        ? await this.readLogFile(this.errorLogFile) 
        : [];

      const appStats = existsSync(this.appLogFile) 
        ? await stat(this.appLogFile) 
        : { size: 0 };
      const errorStats = existsSync(this.errorLogFile) 
        ? await stat(this.errorLogFile) 
        : { size: 0 };

      // Estadísticas combinadas
      const allLogs = [...appLogs];
      const levels = allLogs.reduce((acc, log) => {
        const levelName = this.getLevelName(log.level);
        acc[levelName] = (acc[levelName] || 0) + 1;
        return acc;
      }, {});

      const errorLevels = errorLogs.reduce((acc, log) => {
        const levelName = this.getLevelName(log.level);
        acc[levelName] = (acc[levelName] || 0) + 1;
        return acc;
      }, {});

      const oldest = allLogs.length > 0 ? allLogs[allLogs.length - 1].timestamp : null;
      const newest = allLogs.length > 0 ? allLogs[0].timestamp : null;

      return {
        files: {
          appLog: {
            entries: appLogs.length,
            size: appStats.size,
            sizeMB: (appStats.size / (1024 * 1024)).toFixed(2),
          },
          errorLog: {
            entries: errorLogs.length,
            size: errorStats.size,
            sizeMB: (errorStats.size / (1024 * 1024)).toFixed(2),
          },
        },
        combined: {
          totalEntries: allLogs.length,
          totalSizeMB: ((appStats.size + errorStats.size) / (1024 * 1024)).toFixed(2),
          levels,
          errorLevels,
          timeRange: {
            oldest,
            newest,
          },
        }
      };
    } catch (error) {
      this.logger.error(`Error getting log stats: ${error.message}`);
      throw error;
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

  private getLevelNumber(levelName: string): number | undefined {
    const levelMap: { [key: string]: number } = {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    };
    return levelMap[levelName.toLowerCase()];
  }
}