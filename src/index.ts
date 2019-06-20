import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import Mimic from './lib/mimic';
import Cache from './lib/cache';

import Api from './lib/api/api';
import ApiRoutes from './lib/api/api.routes';

import config from './config';
import ApiError from './lib/api/api.error';

type ApiRouteHandler = (req: Request, res: Response) => void;

const handler = (api: any, method: string): ApiRouteHandler => {

  return async (req: Request, res: Response) => {

    try {

      res.json(await api[method](req, res));
    } catch (err) {

      if (err instanceof ApiError) {
        res.status(err.code).json({ code: err.code, message: err.message });
        return;
      }
      res.status(500).send('Unexpected error occur');
    }
  };
};

const app = express();
const mimic = new Mimic(config.MOCKS_PATH, new Cache());

(async () => {

  app.use(bodyParser.json());

  const apiRoutes = new ApiRoutes(mimic);

  Api.setRoutes(await mimic.getMockedRoutes());
  Api.setMockRoutes(app);

  app.get('/mimic/routes/', handler(apiRoutes, 'getMockedRoutes'));
  app.get('/mimic/routes/:id', handler(apiRoutes, 'getMockedRouteById'));
  app.post('/mimic/routes/', handler(apiRoutes, 'addMockedRoute'));

  app.listen(config.API_PORT, () => {
    console.log(`Server started and listening :${config.API_PORT}`);
  });
})();
