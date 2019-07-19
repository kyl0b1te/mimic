import fs from 'fs';

import 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiFs from 'chai-fs';

import Storage from '../../../../src/lib/mimic/storage';

import { getTestFilesPath, addFile, delFile, addTmpFile, addTmpFiles } from '../../helper';

const tests = [
  { filename: 'get.tests.json', data: [{ test: 1 }, { test: 2 }] },
];

chai.use(chaiHttp);
chai.use(chaiFs);

describe.only('Storage', () => {

  const testFilesPath = getTestFilesPath();

  const storage = new Storage(testFilesPath);

  before((done) => {

    fs.mkdir(testFilesPath, async () => {

      const created = tests.map((test) => addFile(test.filename, test.data));
      Promise.all(created).then(() => done());
    });
  });

  after((done) => {

    const deleted = tests.map((test) => delFile(test.filename));
    Promise.all(deleted).then(() => {
      fs.rmdirSync(testFilesPath);
      done();
    });
  })

  it('should return correct number of mocks', async () => {

    const mocks = await storage.getMocks();
    expect(mocks).to.be.an('array').with.length(tests.length);
  });

  it('should return empty list of mocks', async () => {

    const mocks = await (new Storage('/tmp')).getMocks();
    expect(mocks).to.be.an('array').that.is.empty;
  });

  it('should raise error if folder does not exist', () => {

    const promise = (new Storage('/tmp/does-not-exist-folder')).getMocks();
    promise.catch((err) => {

      expect(err).not.to.be.undefined;
      expect(err.code).is.equal('ENOENT');
    });
  });

  it('should load only JSON files to mock', async () => {

    await addTmpFile('get.non-json.txt', async () => {

      const mocks = await storage.getMocks();
      expect(mocks).to.be.an('array').with.length(tests.length);
    });
  });

  it('should skip files with invalid format', async () => {

    const invalid = ['gettest.json', 'info.test.json', 'info..json'];
    await addTmpFiles(invalid, async () => {

      const mocks = await storage.getMocks();
      expect(mocks).to.be.an('array').with.length(tests.length);
    });
  });

  it('should successfully create a new mock file', async () => {

    const filePath = `${testFilesPath}/get.new.json`;
    const data = [{ new: 1 }];

    await storage.saveMock(filePath, data);
    expect(filePath).to.be.a.file()
      .with.content(JSON.stringify(data));

    delFile('get.new.json');
  });

  it('should successfully update a mock file with new content', async () => {

    const filePath = `${testFilesPath}/${tests[0].filename}`;
    const data = [{ new: 1 }];

    await storage.saveMock(filePath, data);
    expect(filePath).to.be.a.file()
      .with.content(JSON.stringify(data));

    addFile(tests[0].filename, tests[0].data);
  });

  it('should raise error if file is not exist', () => {

    const promise = storage.deleteMock('missing.json');
    promise.catch((err) => {

      expect(err).not.be.undefined;
      expect(err.code).equal('ENOENT');
    });
  });

  it('should delete existing mock file', async () => {

    addFile('get.to-delete.json', []);
    await storage.deleteMock(`${testFilesPath}/get.to-delete.json`);

    expect(testFilesPath).to.be.a.directory()
      .and.not.include.files(['get.to-delete.json']);
  });

  it('should return valid mock file path', () => {

    const methods = ['get', 'post', 'delete', 'put'];

    methods.map((method: string) => {

      expect(storage.getMockFilePath(method, 'test'))
        .to.be.equal(`${testFilesPath}/${method}.test.json`);

      expect(storage.getMockFilePath(method, '/test'))
        .to.be.equal(`${testFilesPath}/${method}.test.json`);
    })
  });

  it('should update existing mock file', async () => {

    const filePath = `${testFilesPath}/get.update-mock.json`;
    const newData = [{ changed: 'OK' }];

    addTmpFile('get.update-mock.json', async () => {

      await storage.updateMock(filePath, filePath, newData);
      expect(filePath).to.be.a.file().with.content(JSON.stringify(newData));
    });
  });

  it('should create new mock file and delete old one', async () => {

    const oldFilePath = `${testFilesPath}/get.old.json`;
    const newFilePath = `${testFilesPath}/get.new.json`;
    const newData = [{ changed: 'OK' }];

    await addFile('get.old.json', []);

    await storage.updateMock(oldFilePath, newFilePath, newData);

    expect(testFilesPath).to.be.a.directory()
      .and.not.include.files(['get.old.json']);
    expect(newFilePath).to.be.a.file().with.content(JSON.stringify(newData));

    await delFile('get.new.json');
  })

});
