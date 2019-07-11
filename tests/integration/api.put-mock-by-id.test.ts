import 'mocha';
import fs from 'fs';
import chaiHttp from 'chai-http';
import chaiFs from 'chai-fs';
import chai, { expect } from 'chai';
import { Express } from 'express';

import getApp from './helper';
import { Mock } from '../../src/lib/mimic/storage';

chai.use(chaiHttp);
chai.use(chaiFs);

describe('PUT /mimic/mocks/:id', () => {

  const testPath = '/tmp/mimic-tests';
  const testFilePath = `${testPath}/get.tests.json`;

  let app: Express;
  let mock: Mock;

  before((done) => {

    fs.mkdir(testPath, () => {

      fs.writeFile(testFilePath, JSON.stringify({ test: 1 }), async () => {

        app = await getApp(testPath);
        chai.request(app).get('/mimic/mocks').end((_, res) => {

          mock = res.body[0];
          done();
        });
      })
    });
  });

  after((done) => {

    fs.unlink(testFilePath, () => fs.rmdir(testPath, done));
  });

  const cleanUp = (): Promise<void> => {

    return new Promise((resolve) => {

      fs.writeFile(testFilePath, JSON.stringify({ test: 1 }), () => {

        fs.unlink(`${testPath}/get.new-tests.json`, () => resolve());
      });
    })
  }

  it('should return 404 for invalid hash', (done) => {

    chai.request(app).put('/mimic/mocks/888000111').end((_, res) => {

      expect(res).to.have.status(404);
      done();
    });
  });

  it('should return 422 for missing parameters', (done) => {

    chai.request(app).put(`/mimic/mocks/${mock.hash}`).end((_, res) => {

      expect(res).to.have.status(422);
      done();
    });
  });

  it('should return 422 for invalid endpoint parameter value', () => {

    chai.request(app).put(`/mimic/mocks/${mock.hash}`)
      .type('json')
      .send({ httpMethod: 'get', endpoint: 'tests', response: { test: 'changed' } })
      .end((_, res) => {

        expect(res).to.have.status(422);
      });
  });

  it('should update file content', (done) => {

    chai.request(app).put(`/mimic/mocks/${mock.hash}`)
      .type('json')
      .send({ httpMethod: 'get', endpoint: '/tests', response: { test: 'changed' } })
      .end((_, res) => {

        expect(res).to.have.status(200);
        expect(testFilePath).to.be.a.file()
          .with.content(JSON.stringify({ test: 'changed' }));
        done();
      });
  });

  it('should delete old mock file and create a new one', (done) => {

    chai.request(app).put(`/mimic/mocks/${mock.hash}`)
      .type('json')
      .send({ httpMethod: 'get', endpoint: '/new-tests', response: { test: 1 } })
      .end(async () => {

        expect(testFilePath).to.not.be.a.path();
        expect(`${testPath}/get.new-tests.json`).to.be.a.file().with.content(JSON.stringify({ test: 1 }));
        await cleanUp();
        done();
      });
  });

  it('should return a mock model in the response of replacement request', (done) => {

    chai.request(app).put(`/mimic/mocks/${mock.hash}`)
      .type('json')
      .send({ httpMethod: 'get', endpoint: '/new-tests', response: { test: 1 } })
      .end(async (_, res) => {

        expect(res.status).to.be.equal(200);
        expect(res.body).to.deep.equal({
          endpoint: '/new-tests',
          httpMethod: 'get',
          mockFilePath: '/tmp/mimic-tests/get.new-tests.json',
          hash: '198ad127fd3288ed4ea5414d66408cc78b9a69c3'
        });
        await cleanUp();
        done();
      });
  });

  it('should return a mock model in the response of update request', (done) => {

    chai.request(app).put(`/mimic/mocks/${mock.hash}`)
      .type('json')
      .send({ httpMethod: 'get', endpoint: '/tests', response: { test: 1 } })
      .end((_, res) => {

        expect(res.status).to.be.equal(200);
        expect(res.body).to.deep.equal(mock);
        done();
      });
  });
});
