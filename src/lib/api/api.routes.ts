import { Request } from 'express';

import ApiError from './api.error';
import Api from "./api";
import Mimic from '../mimic';

interface MockedRoute {
  id: string;
  method: string;
  path: string;
  response?: Record<string, any>;
}

export default class ApiRoutes extends Api {

  constructor(private mimic: Mimic) {
    super();
  }

  public getMockedRoutes(): { routes: MockedRoute[] } {

    const routes: MockedRoute[] = [];
    for (const hash in Api.routes) {

      const { method, path } = Api.routes[hash];
      routes.push({ id: hash, method, path });
    }

    return { routes };
  }

  public async getMockedRouteById(req: Request): Promise<MockedRoute | Record<string, any>> {

    const route = Api.routes[req.params.id];
    if (!route) {

      throw new ApiError(404, 'Not Found');
    }

    return {
      id: req.params.id,
      method: route.method,
      path: route.path,
      response: JSON.parse(await route.handler())
    };
  }

  public addMockedRoute(req: Request): void {

    const { method, path, response } = req.body;
    if (!method || !path || !response) {

      throw new ApiError(420, 'Some parameters are missing in request body');
    }

    this.mimic.addMockedRoute(method, path, response);
  }
}
