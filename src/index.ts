import express, { Request, Response } from 'express';
import { Mimic } from './mimic';

const app = express();
const mimic = new Mimic(`/app/mocks`);

(async () => {

  const routes = await mimic.getMockedRoutes();
  routes.map(({ method, path, handler }) => {

    app[method](path, async (req: Request, res: Response) => {

      const mock = await handler();
      res.json(JSON.parse(mock.toString()));
    });

    console.log(`Route ${method.toUpperCase()} '${path}' was set`);
  });

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World');
  });

  app.listen(8080, () => {
    console.log('Server started and listening :8080');
  });
})();
