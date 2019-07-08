import { Express, Request, Response } from 'express';

import ApiError from './api.error';
import Log, { LogRecord } from '../log';
import { ApiRoute, HttpMethod } from './api';
import { Mock } from '../mimic/storage';
import Mimic from '../mimic/mimic';

export default class ApiInternal {

  private log: Log;

  public constructor(private app: Express, private mimic: Mimic) {

    this.log = this.app.get('log');
  }

  public getInternalApiRoutes(): ApiRoute[] {

    return [
      this.route('get', '/mocks', this.getMocks),
      this.route('post', '/mocks', this.addMock),
      this.route('get', '/mocks/:id', this.getMockById),
      this.route('get', '/mocks/:id/logs', this.getMockLogs),
      this.route('delete', '/mocks/:id', this.delMockById)
    ];
  }

  private getMocks(): Mock[] {

    return this.mimic.getMocks();
  }

  private async addMock(req: Request): Promise<{ status: boolean }> {

    const { method, path, response } = req.body;
    if (!method || !path || !response) {

      throw new ApiError(422, 'Some parameters are missing in request body');
    }
    return await this.mimic.addMock(method, path, response);
  }

  private async getMockById(req: Request): Promise<Mock & { response: Record<string, any> }> {

    const { mock } = this.getRequestMock(req);
    return {
      ...mock,
      response: JSON.parse((await mock.getMockResponse()).toString())
    };
  }

  private getMockLogs(req: Request): LogRecord[] {

    const { hash } = this.getRequestMock(req);
    return this.log.getLogs(hash);
  }

  private async delMockById(req: Request): Promise<{ status: boolean }> {

    const { mock } = this.getRequestMock(req);
    return await this.mimic.deleteMock(mock);
  }

  private getRequestMock(req: Request): { hash: string; mock: Mock } {

    const hash = req.params.id;
    const mock = this.mimic.getMockByHash(hash);
    if (!mock) {

      throw new ApiError(404, 'Not Found');
    }
    return { hash, mock };
  }

  private route(
    method: HttpMethod,
    path: string,
    getResponse: (req: Request, res: Response) => any
  ): ApiRoute {

    return {
      hash: `internal-${method}-${path}`,
      path: `/mimic${path}`,
      method,
      needLog: false,
      needCache: false,
      handler: async (req: Request, res: Response): Promise<Buffer> => {

        const response = await getResponse.call(this, req, res);
        return Buffer.from(JSON.stringify(response));
      }
    };
  }
}
