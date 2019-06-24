import fs from 'fs';
import path from 'path';

import Cache from './cache';
import { Route, RouteMethod, RouteHandler } from './api/api';

export default class Mimic {

  public constructor(
    private mockPath: string,
    private cache: Cache
  ) { }

  public async getMockedRoutes(): Promise<Route[]> {

    const files = await this.getMockFiles();
    return files.map((file: string) => this.getRouteByFilePath(file));
  }

  public addMockedRoute(method: string, path: string, response: Record<string, any>): Promise<boolean> {

    const filePath = this.getMockFilePath(method, path);
    return this.saveMockData(filePath, response);
  }

  public deleteMockedRoute(route: Route): Promise<boolean> {

    const filePath = this.getMockFilePath(route.method, route.path.substr(1));
    return this.deleteMockData(filePath);
  }

  private getRouteByFilePath(filePath: string): Route {

    const source = filePath.split('.');
    source.pop();

    return {
      method: source.shift() as RouteMethod,
      path: `/${source.join('/')}`,
      handler: this.getRouteHandler(path.join(this.mockPath, filePath))
    };
  }

  private getRouteHandler(filePath: string): RouteHandler {

    return async () => {

      let mock = this.cache.get(filePath);
      if (!mock) {
        mock = (await this.getMockFromFile(filePath)).toString();
        this.cache.set(filePath, mock);
      }
      return mock;
    }
  }

  private getMockFiles(): Promise<string[]> {

    return new Promise((resolve, reject) => {

      fs.readdir(this.mockPath, (err: Error | null, files: string[]) => {

        const filtered = files.filter((file: string) => file.endsWith('.json'));
        return err != null ? reject(err) : resolve(filtered);
      });
    });
  }

  private getMockFromFile(filePath: string): Promise<Buffer> {

    return new Promise((resolve, reject) => {

      fs.readFile(filePath, (err: Error | null, data: Buffer) => {

        return err != null ? reject(err) : resolve(data);
      });
    });
  }

  private saveMockData(filePath: string, mock: Record<string, any>): Promise<boolean> {

    return new Promise((resolve, reject) => {

      return fs.writeFile(filePath, JSON.stringify(mock), (err: Error | null) => {

        return err != null ? reject(err) : resolve(true);
      });
    });
  }

  private getMockFilePath(method: string, endpoint: string): string {

    return path.join(this.mockPath, `${method.toLowerCase()}.${endpoint.replace(/\//g, '.')}.json`);
  }

  private deleteMockData(filePath: string): Promise<boolean> {

    return new Promise((resolve, reject) => {

      fs.unlink(filePath, (err: Error | null) => {

        return err != null ? reject(err) : resolve(true);
      });
    });
  }
}
