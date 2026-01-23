
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { readdir, readFile} from 'fs/promises';
import { GetLogsDto } from './dto/get-log.dto';


@Injectable()
export class LogService {
  private readonly logsDir = join(process.cwd(), 'logs');

  async getLogs(getLogsDto: GetLogsDto): Promise<any> {
    try {
      const page = getLogsDto.page ?? 1;
      const limit = getLogsDto.limit ?? 50;
      const { search, level, correlationId, startDate, endDate, order } =
        getLogsDto;

      const skip = (page - 1) * limit;

      const files = await this.getLogFiles();
      let allLogs: any[] = [];

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

      return {
        paginatedLogs,
        page,
        limit,
        total,
        filters,
      }
    } catch (error) {
      throw error;
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
      console.log(error);
      return [];
    }
  }

  private async readLogFile(filePath: string): Promise<any[]> {
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
        .filter((log): log is any => log !== null);
    } catch (error) {
      console.log(error);
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

}
