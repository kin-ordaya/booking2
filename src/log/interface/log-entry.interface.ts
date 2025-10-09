export interface LogEntry {
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