import crypto from 'crypto';
import { Express, Request, Response } from 'express';

export type RouteHandler = () => Promise<string>;
export type RouteMethod = 'get' | 'post' | 'put' | 'delete';

export interface Route {
  method: RouteMethod;
  path: string;
  handler: RouteHandler;
}

export default class Api {

  protected static routes: { [key: string]: Route } = {};

  public static setRoutes(routes: Route[]): void {

    routes.map((route: Route) => {

      const hash = Api.getRouteHash(route);
      Api.routes[hash] = route;
    });
  }

  public static setMockRoutes(app: Express): void {

    for (const hash in Api.routes) {
      const route = Api.routes[hash];

      app[route.method](route.path, async (req: Request, res: Response) => {

        const mock = await route.handler();
        res.json(JSON.parse(mock));
      });

      console.log(`Route ${route.method.toUpperCase()} '${route.path}' was set`);
    }
  }

  protected static getRouteHash(route: Route): string {

    return crypto.createHash('sha1').update(route.method + route.path).digest('hex');
  }
}
