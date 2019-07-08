import 'mocha';
import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import { Express } from 'express';

import getApp from './helper';

chai.use(chaiHttp);

describe('GET /mimic/mocks', () => {

  let app: Express;
  beforeEach(async () => app = await getApp());

  it('should return a 200 status', (done) => {

    chai.request(app).get('/mimic/mocks').end((_, res) => {

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      done();
    })
  });

  it('should return a list of mock models', (done) => {

    chai.request(app).get('/mimic/mocks').end((_, res) => {

      expect(res.body).to.be.an('array').that.is.not.empty;
      res.body.map((mock: any) => {

        expect(mock).to.have.all.keys('endpoint', 'httpMethod', 'mockFilePath', 'hash');
      });
      done();
    });
  });

});
