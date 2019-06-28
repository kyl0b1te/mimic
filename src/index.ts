import express from 'express';
import bodyParser from 'body-parser';

import Log from './lib/log';
import Cache from './lib/cache';
import Mimic from './lib/mimic/mimic';
import Storage from './lib/mimic/storage';

import Api from './lib/api/api';
import ApiInternal from './lib/api/api.internal';

const app = express();

(async () => {

  const cache = new Cache();

  app.use(bodyParser.json());
  app.set('cache', cache);
  app.set('log', new Log(cache));

  const storage = new Storage(process.env.MOCKS_PATH + '');
  const mimic = new Mimic(storage);

  const api = new Api(app);
  api.setRoutes([
    ...await mimic.getMockedRoutes(),
    ...(new ApiInternal(app, mimic)).getInternalApiRoutes()
  ]);

  if (!process.env.API_PORT) {
    throw new Error('API port is missing in env');
  }

  api.startServer(+process.env.API_PORT);
})();
