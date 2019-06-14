import express, { Request, Response } from 'express';

import Mimic from './lib/mimic';
import Cache from './lib/cache';
import Api from './lib/api';

import config from './config';

type ApiRouteHandler = (req: Request, res: Response) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (api: any, method: string): ApiRouteHandler => {

  return (req: Request, res: Response) => api[method](req, res);
};

const app = express();
const mimic = new Mimic(config.MOCKS_PATH, new Cache());

(async () => {

  const api = new Api(await mimic.getMockedRoutes());

  api.setMockRoutes(app);

  app.get('/mimic/routes/', handler(api, 'getRoutes'));
  app.get('/mimic/routes/:id', handler(api, 'getRouteById'));

  app.listen(config.API_PORT, () => {
    console.log(`Server started and listening :${config.API_PORT}`);
  });
})();
