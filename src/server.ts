import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import Log from './lib/log';
import Cache from './lib/cache';
import Mimic from './lib/mimic/mimic';
import Storage from './lib/mimic/storage';

import Api from './lib/api/api';
import ApiInternal from './lib/api/api.internal';

export default class Server {

  public app: Express;
  private api: Api;

  public constructor() {

    this.app = express();
    this.app.use(bodyParser.json());

    const cache = new Cache();
    this.app.set('cache', cache);
    this.app.set('log', new Log(cache));
    this.app.use(cors());
  }

  public async setRoutes(mocksPath: string): Promise<Server> {

    const storage = new Storage(mocksPath);
    const mimic = new Mimic(storage);

    this.api = new Api(this.app);
    this.api.setRoutes([
      ...await mimic.getMockedRoutes(),
      ...(new ApiInternal(this.app, mimic)).getInternalApiRoutes()
    ]);

    return this;
  }

  public start(appPort: number): void {

    this.api.startServer(appPort);
  }
}
