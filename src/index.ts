import express from 'express';
import bodyParser from 'body-parser';

import Mimic from './lib/mimic';
import Cache from './lib/cache';

import Api from './lib/api/api';
import ApiRoutes from './lib/api/api.routes';

const app = express();
(async () => {

  const mimic = new Mimic(process.env.MOCKS_PATH + '', new Cache());

  app.use(bodyParser.json());

  const apiRoutes = new ApiRoutes(mimic);
  Api.setRoutes(await mimic.getMockedRoutes());
  Api.setMockRoutes(app);

  app.get('/mimic/routes/', Api.handler(apiRoutes, 'getMockedRoutes'));
  app.post('/mimic/routes/', Api.handler(apiRoutes, 'addMockedRoute'));

  app.get('/mimic/routes/:id', Api.handler(apiRoutes, 'getMockedRouteById'));
  app.get('/mimic/routes/:id/logs', Api.handler(apiRoutes, 'getMockedRouteLogsById'));
  app.delete('/mimic/routes/:id', Api.handler(apiRoutes, 'deleteMockedRoute'));

  app.listen(process.env.API_PORT, () => {
    console.log(`Server started and listening :${process.env.API_PORT}`);
  });
})();
