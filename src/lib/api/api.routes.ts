import { Request } from 'express';

import ApiError from './api.error';
import Api, { Route } from "./api";
import Mimic from '../mimic';
import Log, { LogRecord } from '../log';

interface MockedRoute {
  id: string;
  method: string;
  path: string;
  response?: Record<string, any>;
}

export default class ApiRoutes extends Api {

  public constructor(private mimic: Mimic) { super(); }

  public getMockedRoutes(): { routes: MockedRoute[] } {

    const routes = Object.keys(Api.routes).map((id: string) => {

      const { method, path } = Api.routes[id];
      return { id, method, path };
    });

    return { routes };
  }

  public async getMockedRouteById(req: Request): Promise<MockedRoute | Record<string, any>> {

    const { hash, route } = this.getRequestRoute(req);

    return {
      id: hash,
      method: route.method,
      path: route.path,
      response: JSON.parse(await route.handler())
    };
  }

  public async addMockedRoute(req: Request): Promise<{ status: boolean }> {

    const { method, path, response } = req.body;
    if (!method || !path || !response) {

      throw new ApiError(420, 'Some parameters are missing in request body');
    }

    return { status: await this.mimic.addMockedRoute(method, path, response) };
  }

  public getMockedRouteLogsById(req: Request): { logs: LogRecord[] } {

    const { hash } = this.getRequestRoute(req);
    return { logs: Log.getLogs(hash) };
  }

  public async deleteMockedRoute(req: Request): Promise<{ status: boolean }> {

    const { route } = this.getRequestRoute(req);
    return { status: await this.mimic.deleteMockedRoute(route) };
  }

  private getRequestRoute(req: Request): { hash: string; route: Route } {

    const hash = req.params.id;
    const route = Api.routes[hash];
    if (!route) {

      throw new ApiError(404, 'Not Found');
    }

    return { hash, route };
  }
}
