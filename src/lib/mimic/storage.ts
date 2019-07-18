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
    return names.map((name: string) => this.getMock(name));
  }

  public saveMock(filePath: string, content: Record<string, any>): Promise<Mock> {

    return new Promise((resolve, reject) => {

      return fs.writeFile(filePath, JSON.stringify(content), (err: Error | null) => {

        err != null ? reject(err) : resolve(this.getMock(path.basename(filePath)));
      });
    });
  }

  public deleteMock(filePath: string): Promise<Mock> {

    return new Promise((resolve, reject) => {

      fs.unlink(filePath, (err: Error | null) => {

        err != null ? reject(err) : resolve(this.getMock(path.basename(filePath)));
      });
    });
  }

  public async updateMock(oldFilePath: string, newFilePath: string, content: Record<string, any>): Promise<Mock> {

    if (oldFilePath !== newFilePath) {

      await this.deleteMock(oldFilePath);
    }
    return await this.saveMock(newFilePath, content);
  }

  public getMockFilePath(httpMethod: string, endpoint: string): string {

    return path.join(this.filePath, `${httpMethod.toLowerCase()}.${endpoint.substr(1).replace(/\//g, '.')}.json`);
  }

  private getMock(fileName: string): Mock {

    const { httpMethod, endpoint } = this.parseFileName(fileName);
    const mockFilePath = path.join(this.filePath, fileName);

    return {
      endpoint,
      httpMethod: httpMethod as HttpMethod,
      mockFilePath,
      hash: this.getHash(httpMethod + '', endpoint),
      getMockResponse: (): Promise<Buffer> => {

        return this.getMockContentByFileName(fileName);
      }
    }
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

        const mockFiles: string[] = [];
        for (const file of files) {

          if (!file.endsWith('.json')) {
            continue;
          }
          const { httpMethod, endpoint } = this.parseFileName(file);
          if (httpMethod && endpoint) {

            mockFiles.push(file);
          }
        }
        resolve(mockFiles);
      });
    });
  }

  private parseFileName(name: string): { httpMethod: HttpMethod | undefined; endpoint: string } {

    const parts = name.split('.');
    parts.pop();

    const method = parts.shift();
    return {
      httpMethod: this.isHttpMethod(method + '') ? method as HttpMethod : undefined,
      endpoint: `/${parts.join('/')}`
    }
  }

  private getHash(httpMethod: string, endpoint: string): string {

    return crypto.createHash('sha1').update(httpMethod + endpoint).digest('hex');
  }

  private isHttpMethod(method: string): method is HttpMethod {

    return ['get', 'post', 'put', 'delete'].indexOf(method) >= 0;
  }
}
