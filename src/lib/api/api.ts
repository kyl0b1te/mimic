import { Express, Request, Response } from 'express';

import ApiError from './api.error';
import Cache from '../cache';
import Log from '../log';

type ApiResponse = Promise<Buffer | Record<string, any>>;

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export function isHttpMethod(method: string): method is HttpMethod {

  return ['get', 'post', 'put', 'delete'].indexOf(method) >= 0;
}

export interface ApiRoute {
  hash: string;
  path: string;
  method: HttpMethod;
  needLog: boolean;
  needCache: boolean;
  handler: (req: Request, res: Response) => ApiResponse;
}

export default class Api {

  private log: Log;
  private cache: Cache;

  private headers: {
    'Content-Type': 'application/json';
    'Access-Control-Allow-Origin': '*';
    'Access-Control-Expose-Headers': '*';
    'Access-Control-Allow-Methods': 'HEAD, GET, POST, OPTIONS, PUT, PATCH, DELETE';
    'Access-Control-Allow-Headers': '*';
    'Access-Control-Allow-Credentials': 'true';
  };

  public constructor(private app: Express) {

    this.cache = this.app.get('cache');
    this.log = this.app.get('log');
  }

  public setRoutes(routes: ApiRoute[]): void {

    routes.map((route: ApiRoute) => {

      this.app[route.method](route.path, async (req: Request, res: Response) => {

        this.saveLog(route, req);
        res.setHeader('Content-Type', 'application/json');

        try {

          await this.sendResponse(route, req, res);
        } catch (err) {

          if (err instanceof ApiError) {
            res.status(err.getCode()).json({ code: err.getCode(), message: err.message });
            return;
          }
          res.status(500).send('Unexpected error occur');
        }
      });
    });
  }

  public startServer(port: number): void {

    this.app.listen(port, () => {
      console.log(`Server started and listening :${port}`);
    });
  }

  private saveLog(route: ApiRoute, req: Request): void {

    if (!route.needLog) {

      return;
    }
    this.log.save(route.hash, {
      headers: req.headers,
      query: req.query,
      body: req.body
    });
  }

  private async sendResponse(route: ApiRoute, req: Request, res: Response): Promise<void> {

    const data = await this.getResponseData(route, req, res);

    res.set(this.headers);
    if (data instanceof Buffer) {

      res.send(data.toString());
      return;
    }
    res.json(data);
  }

  private async getResponseData(route: ApiRoute, req: Request, res: Response): ApiResponse {

    if (route.needCache) {

      return await this.getResponseFromCache(route, req, res);
    }
    return await route.handler(req, res);
  }

  private async getResponseFromCache(route: ApiRoute, req: Request, res: Response): Promise<Buffer> {

    const response = this.cache.get(`routes.${route.hash}`);
    if (!response) {

      return this.cache.set(`routes.${route.hash}`, await route.handler(req, res));
    }
    return response;
  }
}
