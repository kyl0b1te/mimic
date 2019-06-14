import { Express, Request, Response } from 'express';

export type RouteHandler = () => Promise<string>;
export type RouteMethod = 'get' | 'post' | 'put' | 'delete';

export interface Route {
  method: RouteMethod;
  path: string;
  handler: RouteHandler;
}

export default class Api {

  public constructor(private routes: Route[]) { }

  public setMockRoutes(app: Express) {

    this.routes.map((route: Route) => {

      app[route.method](route.path, async (req: Request, res: Response) => {

        const mock = await route.handler();
        res.json(JSON.parse(mock));
      });

      console.log(`Route ${route.method.toUpperCase()} '${route.path}' was set`);
    });
  }

  public getRoutes(req: Request, res: Response) {

    res.json({ status: "ok", method: 'getRoutes' });
  }

  public getRouteById(req: Request, res: Response) {

    res.json({ status: "ok", method: 'getRouteById' });
  }
}
