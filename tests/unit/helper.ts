import fs from 'fs';

const getTestFilesPath = () => '/tmp/tests';

const addFile = (name: string, content: Record<string, any>): Promise<string> => {

  return new Promise((resolve) => {

    const filePath = `${getTestFilesPath()}/${name}`;
    fs.writeFile(filePath, JSON.stringify(content), () => resolve(filePath));
  });
}

const delFile = (name: string): Promise<string> => {

  return new Promise((resolve) => {

    const filePath = `${getTestFilesPath()}/${name}`;
    fs.unlink(filePath, () => resolve(filePath));
  })
}

const addTmpFile = async (name: string, fn: () => void) => {

  await addFile(name, []);
  fn();
  await delFile(name);
}

const addTmpFiles = (names: string[], fn: () => void): Promise<void | string[]> => {

  const created = names.map((name: string) => addFile(name, []));
  return Promise.all(created).then(() => {

    fn();
    const deleted = names.map((name: string) => delFile(name));
    return Promise.all(deleted);
  });
}

export {
  getTestFilesPath,
  addFile,
  delFile,
  addTmpFile,
  addTmpFiles
};
