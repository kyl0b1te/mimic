import fs from 'fs';
import path from 'path';

type RouteHandler = () => Promise<Buffer>;
type RouteMethod = 'get' | 'post' | 'put' | 'delete';

export interface Route {
  method: RouteMethod;
  path: string;
  handler: RouteHandler;
}

export class Mimic {

  public constructor(private mockPath: string) { }

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

    return () => {

      return new Promise((resolve, reject) => {

        fs.readFile(filePath, (err: Error | null, data: Buffer) => {

          return err != null ? reject(err) : resolve(data);
        });
      });
    }
  }

  private getMockFiles(): Promise<string[]> {

    return new Promise((resolve, reject) => {

      fs.readdir(this.mockPath, (err: Error | null, files: string[]) => {

        const filtered = files.filter((file: string) => file != '.gitkeep');
        return err != null ? reject(err) : resolve(filtered);
      });
    });
  }
}
