import { IncomingHttpHeaders } from 'http';

export interface LogRecord {
  headers: IncomingHttpHeaders;
  query: Record<string, any>[];
  body: Record<string, any>[];
  timestamp?: number;
}

export default class Log {

  private static logs: { [hash: string]: LogRecord[] } = {};

  public static save(hash: string, record: LogRecord): void {

    if (!Log.logs[hash]) {
      Log.logs[hash] = [];
    }
    Log.logs[hash].push({ timestamp: Log.getTimestamp(), ...record });
  }

  public static getLogs(hash: string): LogRecord[] {

    return Log.logs[hash] || [];
  }

  private static getTimestamp(): number {

    return (new Date()).getTime();
  }
}
