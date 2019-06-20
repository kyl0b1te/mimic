import { Request } from 'express';
import Api, { Route } from "./api";

interface MockedRoute {
  id: number;
  method: string;
  path: string;
  response?: Record<string, any>;
}

export default class ApiRoutes extends Api {

  public getMockedRoutes(): { routes: MockedRoute[] } {

    const routes = Api.routes.map(({ method, path }: Route, id: number) => {

      return { id, method, path };
    });

    return { routes };
  }

  public async getMockedRouteById(req: Request): Promise<MockedRoute | Record<string, any>> {

    const route = Api.routes[req.params.id];
    if (!route) {

      return {};
    }

    return {
      id: +req.params.id,
      method: route.method,
      path: route.path,
      response: JSON.parse(await route.handler())
    };
  }
}
