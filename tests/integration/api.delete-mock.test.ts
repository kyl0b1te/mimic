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

describe('DELETE /mimic/mocks/:id', () => {

  const testPath = '/tmp/mimic-tests';

  let app: Express;

  before((done) => fs.mkdir(testPath, done));
  after((done) => fs.rmdir(testPath, done));

  beforeEach(async () => {

    fs.writeFileSync(`${testPath}/get.tests.json`, '');
    app = await getApp(testPath);
  });

  it('should return 404 for invalid hash', (done) => {

    chai.request(app).delete('/mimic/mocks/888000111').end((_, res) => {

      expect(res).to.have.status(404);
      done();
    });
  });

  it('should return 200 and remove mock file', (done) => {

    chai.request(app).get('/mimic/mocks/').end((_, res) => {

      chai.request(app).delete(`/mimic/mocks/${res.body[0].hash}`).end((_, res) => {

        expect(res).to.have.status(200);
        expect(testPath).to.be.a.directory().and.empty;
        done();
      });
    });
  });

  it('should return mock model in response for successful request', (done) => {

    chai.request(app).get('/mimic/mocks/').end((_, res) => {

      const mock = res.body[0] as Mock;
      chai.request(app).delete(`/mimic/mocks/${mock.hash}`).end((_, res) => {

        expect(res.status).to.be.equal(200);
        expect(res.body).to.deep.equal(mock);
        done();
      });
    });
  });
});
