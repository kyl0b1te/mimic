import { Express, Request, Response } from 'express';
import crypto from 'crypto';

import Log, { LogRecord } from '../log';
import ApiError from './api.error';

type ApiRouteHandler = (req: Request, res: Response) => void;

export type RouteHandler = () => Promise<string>;
export type RouteMethod = 'get' | 'post' | 'put' | 'delete';

export interface Route {
  path: string;
  method: RouteMethod;
  handler: RouteHandler;
}

export default class Api {

  protected static routes: { [key: string]: Route } = {};

  public static handler(api: any, method: string): ApiRouteHandler {

    return async (req: Request, res: Response) => {

      try {

        res.json(await api[method](req, res));
      } catch (err) {

        if (err instanceof ApiError) {
          res.status(err.getCode()).json({ code: err.getCode(), message: err.message });
          return;
        }
        res.status(500).send('Unexpected error occur');
      }
    };
  }

  public static setRoutes(routes: Route[]): void {

    routes.map((route: Route) => Api.routes[Api.getRouteHash(route)] = route);
  }

  public static setMockRoutes(app: Express): void {

    for (const hash in Api.routes) {

      const { method, path, handler } = Api.routes[hash];
      app[method](path, async (req: Request, res: Response) => {

        Log.save(hash, Api.getRequestLogRecord(req));
        res.json(JSON.parse(await handler()));
      });

      console.log(`Route ${method.toUpperCase()} '${path}' was set`);
    }
  }

  protected static getRouteHash(route: Route): string {

    return crypto.createHash('sha1').update(route.method + route.path).digest('hex');
  }

  private static getRequestLogRecord(req: Request): LogRecord {

    return { headers: req.headers, query: req.query, body: req.body };
  }
}
