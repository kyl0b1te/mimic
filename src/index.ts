import express from 'express';

import Mimic from './lib/mimic';
import Cache from './lib/cache';
import Api from './lib/api';

import config from './config';

const app = express();
const mimic = new Mimic(config.MOCKS_PATH, new Cache());

(async () => {

  const api = new Api(await mimic.getMockedRoutes());

  api.setMockRoutes(app);

  app.get('/mimic/routes/', api.getRoutes);
  app.get('/mimic/routes/:id', api.getRouteById);

  app.listen(config.API_PORT, () => {
    console.log(`Server started and listening :${config.API_PORT}`);
  });
})();
