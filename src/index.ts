import Server from './server';

(async () => {

  if (!process.env.MOCKS_PATH) {
    throw new Error('Mocks path is missing in env');
  }

  if (!process.env.API_PORT) {
    throw new Error('API port is missing in env');
  }

  const server = await (new Server()).setRoutes(process.env.MOCKS_PATH);
  server.start(+process.env.API_PORT);
})();
