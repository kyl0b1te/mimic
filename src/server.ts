import express, { Express } from 'express';
import bodyParser from 'body-parser';

import Log from './lib/log';
import Cache from './lib/cache';
import Mimic from './lib/mimic/mimic';
import Storage from './lib/mimic/storage';

import Api from './lib/api/api';
import ApiInternal from './lib/api/api.internal';

export default class Server {

  private app: Express;

  constructor() {

    this.app = express();
    this.app.use(bodyParser.json());

    const cache = new Cache();
    this.app.set('cache', cache);
    this.app.set('log', new Log(cache));
  }

  async start(mocksPath: string, appPort: number) {

    const storage = new Storage(mocksPath);
    const mimic = new Mimic(storage);

    const api = new Api(this.app);
    api.setRoutes([
      ...await mimic.getMockedRoutes(),
      ...(new ApiInternal(this.app, mimic)).getInternalApiRoutes()
    ]);

    api.startServer(appPort);
  }
}
