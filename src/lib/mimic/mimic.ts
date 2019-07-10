import { ApiRoute } from '../api/api';
import Storage, { Mock } from './storage';

export default class Mimic {

  private mocks: Mock[];

  public constructor(private storage: Storage) { }

  public async getMockedRoutes(): Promise<ApiRoute[]> {

    this.mocks = await this.storage.getMocks();
    return this.mocks.map((mock: Mock): ApiRoute => {

      return {
        hash: mock.hash,
        path: mock.endpoint,
        method: mock.httpMethod,
        needLog: true,
        needCache: true,
        handler: mock.getMockResponse
      };
    });
  }

  public getMocks(): Mock[] {

    return this.mocks;
  }

  public async addMock(method: string, path: string, data: Record<string, any>): Promise<Mock> {

    const filePath = this.storage.getMockFilePath(method, path);
    return await this.storage.saveMock(filePath, data);
  }

  public async updateMock(mock: Mock, method: string, path: string, data: Record<string, any>): Promise<Mock> {

    const newFilePath = this.storage.getMockFilePath(method, path);
    return await this.storage.updateMock(mock.mockFilePath, newFilePath, data);
  }

  public getMockByHash(hash: string): Mock | undefined {

    return this.mocks.find((mock: Mock) => mock.hash == hash);
  }

  public async deleteMock(mock: Mock): Promise<Mock> {

    return await this.storage.deleteMock(mock.mockFilePath);
  }
}
