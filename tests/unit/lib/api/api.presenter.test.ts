import 'mocha';
import { expect } from 'chai';

import ApiPresenter from '../../../../src/lib/api/api.presenter';

describe('ApiPresenter', () => {

  it('should return an empty object', () => {

    const res = ApiPresenter.getPresented({}, [], []);
    expect(res).to.be.an('object').and.empty;
  });

  it('should fail in case of different arrays length', () => {

    const fn = () => ApiPresenter.getPresented({ a: 1 }, ['a', 'b'], ['a']);
    expect(fn).to.throw(TypeError);
  });

  it('should fail in case of invalid parameter name in source list', () => {

    const fn = () => ApiPresenter.getPresented({ a: 1, b: 2 }, ['c', 'd'], ['a', 'b']);
    expect(fn).to.throw(TypeError);
  });

  it('should return a valid object in case of full object presentation', () => {

    const res = ApiPresenter.getPresented({a: 1, b: 2, c: 3}, ['a', 'b', 'c'], ['d', 'e', 'f']);
    expect(res).to.be.an('object');
    expect(res).to.have.all.keys('d', 'e', 'f');
    expect(Object.values(res)).to.be.deep.equal([1, 2, 3]);
  });

  it('should return a valid object in case of partial object presentation', () => {

    const res = ApiPresenter.getPresented({ a: 1, b: 2, c: 3 }, ['b'], ['d']);
    expect(res).to.be.an('object');
    expect(res).to.have.all.keys('d');
    expect(Object.values(res)).to.be.deep.equal([2]);
  });
})
