import { Express } from 'express';
import Server from '../../src/server';

export default async (path: string = '/mimic/tests/mocks'): Promise<Express> => {

  const server = await (new Server()).setRoutes(path);
  return server.app;
}
