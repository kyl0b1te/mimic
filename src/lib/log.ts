import { IncomingHttpHeaders } from 'http';

import Cache from './cache';

export interface LogRecord {
  headers: IncomingHttpHeaders;
  query: Record<string, any>[];
  body: Record<string, any>[];
  timestamp?: number;
}

export default class Log {

  public constructor(private cache: Cache) { }

  public save(hash: string, record: LogRecord): void {

    const records = this.cache.get(`logs.${hash}`) || [];
    this.cache.set(
      `logs.${hash}`,
      [
        ...records,
        { ...record, timestamp: (new Date()).getTime() }
      ]
    );
  }

  public getLogs(hash: string): LogRecord[] {

    return this.cache.get(`logs.${hash}`) || [];
  }
}

/*
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
*/
