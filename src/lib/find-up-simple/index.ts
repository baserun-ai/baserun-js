import process from 'node:process';
import fsPromises from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const toPath = (urlOrPath: string | URL) =>
  urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;

export async function findUp(
  name: string,
  {
    cwd = process.cwd(),
    type = 'file',
    stopAt,
  }: { cwd?: string; type?: string; stopAt?: string } = {},
) {
  let directory = path.resolve(toPath(cwd) ?? '');
  const { root } = path.parse(directory);
  stopAt = path.resolve(directory, toPath(stopAt ?? root));

  while (directory && directory !== stopAt && directory !== root) {
    const filePath = path.isAbsolute(name) ? name : path.join(directory, name);

    try {
      const stats = await fsPromises.stat(filePath); // eslint-disable-line no-await-in-loop
      if (
        (type === 'file' && stats.isFile()) ||
        (type === 'directory' && stats.isDirectory())
      ) {
        return filePath;
      }
    } catch {
      //
    }

    directory = path.dirname(directory);
  }
}

export function findUpSync(
  name: string,
  {
    cwd = process.cwd(),
    type = 'file',
    stopAt,
  }: { cwd?: string; type?: string; stopAt?: string } = {},
) {
  let directory = path.resolve(toPath(cwd) ?? '');
  const { root } = path.parse(directory);
  stopAt = path.resolve(directory, toPath(stopAt!) ?? root);

  while (directory && directory !== stopAt && directory !== root) {
    const filePath = path.isAbsolute(name) ? name : path.join(directory, name);

    try {
      const stats = fs.statSync(filePath, { throwIfNoEntry: false });
      if (
        (type === 'file' && stats?.isFile()) ||
        (type === 'directory' && stats?.isDirectory())
      ) {
        return filePath;
      }
    } catch {
      //
    }

    directory = path.dirname(directory);
  }
}
