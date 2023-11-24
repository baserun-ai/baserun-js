import path from 'node:path';
import { findUp, findUpSync } from '../find-up-simple/index.js';

export async function packageDirectory({ cwd }: { cwd?: string } = {}) {
  const filePath = await findUp('package.json', { cwd });
  return filePath && path.dirname(filePath);
}

export function packageDirectorySync({ cwd }: { cwd?: string } = {}) {
  const filePath = findUpSync('package.json', { cwd });
  return filePath && path.dirname(filePath);
}
