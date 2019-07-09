import 'mocha';
import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import { Express } from 'express';

import getApp from './helper';

chai.use(chaiHttp);


describe.only('GET /mimic/mocks/:id/logs', () => {

  let app: Express;
  beforeEach(async () => app = await getApp());

  const visit = async (endpoint: string): Promise<void> => {

    return new Promise((resolve) => {

      chai.request(app).get(endpoint).end(() => resolve());
    });
  };

  it('should return 404 for invalid hash', (done) => {

    chai.request(app).get('/mimic/mocks/888000111/logs').end((_, res) => {

      expect(res).to.have.status(404);
      done();
    });
  });

  it('should return empty array from the start', (done) => {

    chai.request(app).get('/mimic/mocks/').end((_, res) => {

      chai.request(app).get(`/mimic/mocks/${res.body[0].hash}/logs`).end((_, res) => {

        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').that.is.empty;
        done();
      });
    });
  });

  it('should return an array of logs for visited mock', (done) => {

    chai.request(app).get('/mimic/mocks/').end(async (_, res) => {

      const { hash, endpoint } = res.body[0];
      await visit(endpoint);
      await visit(endpoint);
      await visit(endpoint);

      chai.request(app).get(`/mimic/mocks/${hash}/logs`).end((_, res) => {

        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').that.is.not.empty;
        res.body.map((log: any) => {

          expect(log).to.have.all.keys('headers', 'query', 'body', 'timestamp');
        });
        done();
      });
    });
  });
});
