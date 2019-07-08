import 'mocha';
import { expect } from 'chai';

import Cache from '../../../src/lib/cache';

describe('Cache', () => {

  let cache: Cache;

  beforeEach(() => cache = new Cache());

  it('should be empty cache from the start', () => {

    expect(cache['cache']).to.be.an('object').that.is.empty;
  });

  it('should be able set value in cache', () => {

    cache.set('a', '1');
    expect(cache['cache']['a']).to.be.a('string').that.is.equal('1');
  });

  it('should be able to set complex key', () => {

    cache.set('path.to.the.a', '1');
    expect(cache['cache']['path']['to']['the']['a'])
      .to.be.a('string').that.is.equal('1');
  })

  it('should overwrite previously set cache value', () => {

    cache.set('a', '1');
    cache.set('a', '2');
    expect(cache['cache']['a']).to.be.a('string').that.is.equal('2');
  });

  it('should be able to get value from cache if it was set', () => {

    cache.set('a', '1');
    expect(cache.get('a')).to.be.a('string').that.is.equal('1');
  });

  it('should be able to get value by complex path', () => {

    cache.set('path.to.the.a', '1');
    expect(cache.get('path.to.the.a')).to.be.a('string').that.is.equal('1');
  })

  it('should be able to return default value if the key was not set', () => {

    expect(cache.get('a')).to.be.a('undefined');
  });

  it('should return set value', () => {

    const val = cache.set('test', '1');
    expect(val).to.be.equal('1');
  })
});
