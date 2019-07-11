import 'mocha';
import fs from 'fs';
import chaiHttp from 'chai-http';
import chaiFs from 'chai-fs';
import chai, { expect } from 'chai';
import { Express } from 'express';

import getApp from './helper';

chai.use(chaiHttp);
chai.use(chaiFs);

describe('POST /mimic/mocks', () => {

  const testPath = '/tmp/mimic-tests';

  let app: Express;

  before((done) => fs.mkdir(testPath, done));
  after((done) => fs.rmdir(testPath, done));

  beforeEach(async () => app = await getApp(testPath));

  it('fail with status 422 for missing method parameter', (done) => {

    chai.request(app).post('/mimic/mocks/').type('json')
      .send({ endpoint: '/test', response: { test: '1' } })
      .end((_, res) => {

        expect(res.status).to.be.equal(422);
        done();
      });
  });

  it('fail with status 422 for missing path parameter', (done) => {

    chai.request(app).post('/mimic/mocks/').type('json')
      .send({ httpMethod: 'GET', response: { test: '1' } })
      .end((_, res) => {

        expect(res.status).to.be.equal(422);
        done();
      });
  });

  it('fail with status 422 for missing response parameter', (done) => {

    chai.request(app).post('/mimic/mocks/').type('json')
      .send({ httpMethod: 'GET', endpoint: '/test' })
      .end((_, res) => {

        expect(res.status).to.be.equal(422);
        done();
      });
  });

  it('fail with status 422 for invalid method value', (done) => {

    chai.request(app).post('/mimic/mocks/').type('json')
      .send({ httpMethod: 'invalid', endpoint: '/test', response: { test: '1' } })
      .end((_, res) => {

        expect(res.status).to.be.equal(422);
        done();
      });
  });

  it('fail with status 422 for invalid endpoint value', (done) => {

    chai.request(app).post('/mimic/mocks/').type('json')
      .send({ httpMethod: 'get', endpoint: 'test', response: { test: '1' } })
      .end((_, res) => {

        expect(res.status).to.be.equal(422);
        done();
      });
  });

  it('should return a mock model in success request', (done) => {

    chai.request(app).post('/mimic/mocks/').type('json')
      .send({ httpMethod: 'get', endpoint: '/test', response: { test: 1 } })
      .end((_, res) => {

        expect(res.status).to.be.equal(200);
        expect(res.body).to.have.all.keys('endpoint', 'httpMethod', 'mockFilePath', 'hash');
        delete res.body.hash;
        expect(res.body).to.deep.equal({
          httpMethod: 'get',
          endpoint: '/test',
          mockFilePath: `${testPath}/get.test.json`
        });
        done();
      });
  });

  it('should succeed and create a new mock file', (done) => {

    const response = { test: '1' };

    chai.request(app).post('/mimic/mocks/').type('json')
      .send({ httpMethod: 'get', endpoint: '/test', response })
      .end(() => {

        expect(`${testPath}/get.test.json`).to.be.a.file()
          .with.content(JSON.stringify(response));

        fs.unlink(`${testPath}/get.test.json`, done);
      });
  })
})
