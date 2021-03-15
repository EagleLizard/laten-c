
import fs from 'fs';
import { promisify } from 'util';
const mkdir = promisify(fs.mkdir);
// const readdir = promisify(fs.readdir);
const access = promisify(fs.access);
// export const readFile = promisify(fs.readFile);

export async function mkdirIfNotExist(dirPath: string) {
  try {
    await mkdir(dirPath);
  } catch(e) {
    if(!(e.code === 'EEXIST')) {
      throw e;
    }
  }
}

export async function exists(filePath: string) {
  let fileExists;
  try {
    await access(filePath, fs.constants.F_OK);
    fileExists = true;
  } catch(e) {
    fileExists = false;
  }
  return fileExists;
}
