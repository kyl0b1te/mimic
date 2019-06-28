import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export interface MockConfig {
  hash: string;
  endpoint: string;
  httpMethod: HttpMethod;
  mockFilePath: string;
}

export interface Mock extends MockConfig {
  getMockResponse: () => Promise<Buffer>;
}

export default class Storage {

  public constructor(private filePath: string) { }

  public async getMocks(): Promise<Mock[]> {

    const names = await this.getMockFileNames();
    return names.map((name: string): Mock => {

      const { httpMethod, endpoint } = this.parseFileName(name);
      const mockFilePath = path.join(this.filePath, name);

      return {
        endpoint,
        httpMethod,
        mockFilePath,
        hash: this.getHash(httpMethod, endpoint),
        getMockResponse: (): Promise<Buffer> => {

          return this.getMockContentByFileName(name);
        }
      }
    })
  }

  public saveMock(filePath: string, content: Record<string, any>): Promise<boolean> {

    return new Promise((resolve, reject) => {

      return fs.writeFile(filePath, JSON.stringify(content), (err: Error | null) => {

        err != null ? reject(err) : resolve(true);
      });
    });
  }

  public deleteMock(filePath: string): Promise<boolean> {

    return new Promise((resolve, reject) => {

      fs.unlink(filePath, (err: Error | null) => {

        err != null ? reject(err) : resolve(true);
      });
    });
  }

  public getMockFilePath(httpMethod: string, endpoint: string): string {

    return path.join(this.filePath, `${httpMethod.toLowerCase()}.${endpoint.replace(/\//g, '.')}.json`);
  }

  private getMockContentByFileName(name: string): Promise<Buffer> {

    return new Promise((resolve, reject) => {

      fs.readFile(path.join(this.filePath, name), (err: Error | null, data: Buffer) => {

        return err != null ? reject(err) : resolve(data);
      });
    });
  }

  private getMockFileNames(): Promise<string[]> {

    return new Promise((resolve, reject) => {

      fs.readdir(this.filePath, (err: Error | null, files: string[]) => {

        if (err != null) {
          return reject(err);
        }

        resolve(files.filter((file: string) => file.endsWith('.json')));
      });
    });
  }

  private parseFileName(name: string): { httpMethod: HttpMethod; endpoint: string } {

    const parts = name.split('.');
    parts.pop();

    return {
      httpMethod: parts.shift() as HttpMethod,
      endpoint: `/${parts.join('/')}`
    }
  }

  private getHash(httpMethod: string, endpoint: string): string {

    return crypto.createHash('sha1').update(httpMethod + endpoint).digest('hex');
  }
}
