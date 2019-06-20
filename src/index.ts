import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import Mimic from './lib/mimic';
import Cache from './lib/cache';

import Api from './lib/api/api';
import ApiRoutes from './lib/api/api.routes';

import config from './config';

type ApiRouteHandler = (req: Request, res: Response) => void;

const handler = (api: any, method: string): ApiRouteHandler => {

  return async (req: Request, res: Response) => {

    res.json(await api[method](req, res));
  };
};

const app = express();
const mimic = new Mimic(config.MOCKS_PATH, new Cache());

(async () => {

  app.use(bodyParser.json());

  Api.setRoutes(await mimic.getMockedRoutes());
  Api.setMockRoutes(app);

  const apiRoutes = new ApiRoutes(mimic);

  app.get('/mimic/routes/', handler(apiRoutes, 'getMockedRoutes'));
  app.get('/mimic/routes/:id', handler(apiRoutes, 'getMockedRouteById'));
  app.post('/mimic/routes/', handler(apiRoutes, 'addMockedRoute'));

  app.listen(config.API_PORT, () => {
    console.log(`Server started and listening :${config.API_PORT}`);
  });
})();
