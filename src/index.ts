import express, { Request, Response } from 'express';

import config from './config';
import { Mimic, Route } from './lib/mimic';
import Cache from './lib/cache';

const app = express();
const mimic = new Mimic(config.MOCKS_PATH);
const cache = new Cache();

const getMockData = async (route: Route): Promise<string> => {

  let mock = cache.get(route.path);
  if (!mock) {
    mock = (await route.handler()).toString();
    cache.set(route.path, mock);
  }
  return mock;
};

(async () => {

  const routes = await mimic.getMockedRoutes();
  routes.map((route: Route) => {

    app[route.method](route.path, async (req: Request, res: Response) => {

      const mock = await getMockData(route);
      res.json(JSON.parse(mock));
    });

    console.log(`Route ${route.method.toUpperCase()} '${route.path}' was set`);
  });

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World');
  });

  app.listen(config.API_PORT, () => {
    console.log(`Server started and listening :${config.API_PORT}`);
  });
})();
