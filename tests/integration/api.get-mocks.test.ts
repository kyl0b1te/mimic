import 'mocha';
import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import { Express } from 'express';

import getApp from './helper';

chai.use(chaiHttp);

describe('GET /mimic/mocks', () => {

  let app: Express;
  beforeEach(async () => app = await getApp());

  it('should be empty list of mocks for empty mocks folder', async () => {

    chai.request(await getApp('/tmp')).get('/mimic/mocks/').end((_, res) => {

      expect(res.body).to.be.an('array').that.is.empty;
    });
  });

  it('should return a 200 status', (done) => {

    chai.request(app).get('/mimic/mocks').end((_, res) => {

      expect(res.status).to.be.equal(200);
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
