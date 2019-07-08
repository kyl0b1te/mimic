import { Express } from 'express';
import Server from '../../src/server';

export default async (): Promise<Express> => {

  const server = await (new Server()).setRoutes('/mimic/tests/mocks');
  return server.app;
}
