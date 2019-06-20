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
}
