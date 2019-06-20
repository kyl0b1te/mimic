import { Express, Request, Response } from 'express';

export type RouteHandler = () => Promise<string>;
export type RouteMethod = 'get' | 'post' | 'put' | 'delete';

export interface Route {
  method: RouteMethod;
  path: string;
  handler: RouteHandler;
}

export default class Api {

  protected static routes: Route[];

  public static setRoutes(routes: Route[]): void {

    Api.routes = routes;
  }

  public static setMockRoutes(app: Express): void {

    Api.routes.map((route: Route) => {

      app[route.method](route.path, async (req: Request, res: Response) => {

        const mock = await route.handler();
        res.json(JSON.parse(mock));
      });

      console.log(`Route ${route.method.toUpperCase()} '${route.path}' was set`);
    });
  }
}
