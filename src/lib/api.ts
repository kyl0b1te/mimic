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

  public setMockRoutes(app: Express): void {

    this.routes.map((route: Route) => {

      app[route.method](route.path, async (req: Request, res: Response) => {

        const mock = await route.handler();
        res.json(JSON.parse(mock));
      });

      console.log(`Route ${route.method.toUpperCase()} '${route.path}' was set`);
    });
  }

  public getRoutes(req: Request, res: Response): void {

    const routes = this.routes.map(
      (route: Route, id: number) => { return { id, ...route } }
    );
    res.json({ routes });
  }

  public getRouteById(req: Request, res: Response): void {

    const route = this.routes[req.params.id];
    res.json(
      route ? { id: +req.params.id, ...route } : { }
    );
  }
}
