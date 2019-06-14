import express, { Request, Response } from 'express';

import config from './config';
import { Mimic, Route } from './lib/mimic';
import Cache from './lib/cache';
import Api from './lib/api';

const app = express();
const mimic = new Mimic(config.MOCKS_PATH, new Cache());

(async () => {

  const routes = await mimic.getMockedRoutes();
  const api = new Api(routes);

  api.setMockRoutes(app);

  app.get('/mimic/routes/', api.getRoutes);
  app.get('/mimic/routes/:id', api.getRouteById);

  app.listen(config.API_PORT, () => {
    console.log(`Server started and listening :${config.API_PORT}`);
  });
})();
