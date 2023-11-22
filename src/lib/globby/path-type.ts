import fs, { promises as fsPromises } from 'fs';

async function isType(
  fsStatType: keyof typeof fsPromises,
  statsMethodName: any,
  filePath: string,
) {
  if (typeof filePath !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof filePath}`);
  }

  try {
    const stats = await (fsPromises[fsStatType] as any)(filePath);
    return stats[statsMethodName]();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

function isTypeSync(
  fsStatType: keyof typeof fsPromises,
  statsMethodName: any,
  filePath: string,
) {
  if (typeof filePath !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof filePath}`);
  }

  try {
    return (fs[fsStatType] as any)(filePath)[statsMethodName]();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

export const isFile = isType.bind(null, 'stat', 'isFile');
export const isDirectory = isType.bind(null, 'stat', 'isDirectory');
export const isSymlink = isType.bind(null, 'lstat', 'isSymbolicLink');
export const isFileSync = isTypeSync.bind(null, 'statSync' as any, 'isFile');
export const isDirectorySync = isTypeSync.bind(
  null,
  'statSync' as any,
  'isDirectory',
);
export const isSymlinkSync = isTypeSync.bind(
  null,
  'lstatSync' as any,
  'isSymbolicLink',
);
