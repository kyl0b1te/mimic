import express, { Request, Response } from 'express';
import { Mimic, Route } from './mimic';
import Cache from './cache';

const app = express();
const mimic = new Mimic(`/app/mocks`);
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

  app.listen(8080, () => {
    console.log('Server started and listening :8080');
  });
})();