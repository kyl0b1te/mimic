import 'mocha';
import { expect } from 'chai';

import Cache from '../../src/lib/cache';
import Log, { LogRecord } from '../../src/lib/log';

describe('Log', () => {

  const record: LogRecord = {
    headers: {},
    query: [{ 'qs-parameter': 'value' }],
    body: [{ 'body-parameter': 'value' }],
    timestamp: 0
  };

  let cache: Cache;
  let log: Log;

  beforeEach(() => {
    cache = new Cache();
    log = new Log(cache)
  });

  it('should create new logs array for new hash', () => {

    log.save('test', record);
    expect(cache.get('logs.test')).to.be.an('array').that.have.lengthOf(1);
  });

  it('should store log record interface data', () => {

    const testRecord = Object.assign({}, record);
    delete testRecord.timestamp;

    log.save('test', testRecord);
    expect(cache.get('logs.test')[0]).to.deep.include(testRecord);
  });

  it('should set timestamp information', () => {

    log.save('test', record);
    expect(cache.get('logs.test')[0].timestamp).to.not.equal(0);
  });

  it('should store multiple records associate for one hash', () => {

    new Array(3).fill(undefined).map(() => log.save('test', record));
    expect(cache.get('logs.test')).to.be.an('array').that.have.lengthOf(3);
  });

  it('should return an empty array for new hash', () => {

    log.save('test', record);
    expect(log.getLogs('new')).to.be.an('array').that.have.lengthOf(0);
  });

  it('should return a list of records for existing hash', () => {

    log.save('test', record);
    expect(log.getLogs('test')).to.be.an('array').that.have.lengthOf(1);
  });
});
