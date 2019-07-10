import { Express, Request, Response } from 'express';

import ApiError from './api.error';
import Log, { LogRecord } from '../log';
import { ApiRoute, HttpMethod, isHttpMethod } from './api';
import { Mock } from '../mimic/storage';
import Mimic from '../mimic/mimic';

interface RequestMockParameters {
  method: HttpMethod;
  path: string;
  response: Record<string, any>;
}

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
      this.route('put', '/mocks/:id', this.updateMock),
      this.route('delete', '/mocks/:id', this.delMockById),
      this.route('get', '/mocks/:id/logs', this.getMockLogs)
    ];
  }

  private getMocks(): Mock[] {

    return this.mimic.getMocks();
  }

  private async addMock(req: Request): Promise<Mock> {

    const { method, path, response } = this.getMockParametersFromRequest(req);
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

  private async delMockById(req: Request): Promise<Mock> {

    const { mock } = this.getRequestMock(req);
    return await this.mimic.deleteMock(mock);
  }

  private async updateMock(req: Request): Promise<Mock> {

    const { mock } = this.getRequestMock(req);
    const { method, path, response } = this.getMockParametersFromRequest(req);

    return await this.mimic.updateMock(mock, method, path, response);
  }

  private getMockParametersFromRequest(req: Request): RequestMockParameters {

    const { method, path, response } = req.body;
    if (!method || !path || !response || !isHttpMethod(method)) {

      throw new ApiError(422, 'Some parameters are missing in request body');
    }
    return { method, path, response };
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
