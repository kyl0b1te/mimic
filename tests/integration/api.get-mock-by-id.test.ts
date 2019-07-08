import 'mocha';
import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import { Express } from 'express';

import getApp from './helper';

chai.use(chaiHttp);

describe('GET /mimic/mocks/:id', () => {

  let app: Express;
  beforeEach(async () => app = await getApp());

  it('should return a 404 for invalid hash', (done) => {

    chai.request(app).get('/mimic/mocks/888800001111').end((_, res) => {

      expect(res).to.have.status(404);
      done();
    });
  });

  it('should return a 200 for valid hash', (done) => {

    chai.request(app).get('/mimic/mocks/').end((_, res) => {

      chai.request(app).get(`/mimic/mocks/${res.body[0].hash}`).end((_, res) => {

        expect(res).to.have.status(200);
        done();
      });
    });
  });

  it('should return a valid mock structure', (done) => {

    chai.request(app).get('/mimic/mocks/').end((_, res) => {

      chai.request(app).get(`/mimic/mocks/${res.body[0].hash}`).end((_, res) => {

        expect(res.body).to.have.all.keys(
          'endpoint',
          'httpMethod',
          'mockFilePath',
          'hash',
          'response'
        );
        done();
      });
    });
  });
});
