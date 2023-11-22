import process from 'node:process';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import fastGlob from 'fast-glob';
import gitIgnore from 'ignore';

import { isNegativePattern } from './utilities.js';
import { toPath } from './index.js';
import slash from '../slash/index.js';

const ignoreFilesGlobOptions = {
  ignore: ['**/node_modules', '**/flow-typed', '**/coverage', '**/.git'],
  absolute: true,
  dot: true,
};

const ignore =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  typeof gitIgnore === 'function' ? gitIgnore() : gitIgnore.default();

export const GITIGNORE_FILES_PATTERN = '**/.gitignore';

const applyBaseToPattern = (pattern: string, base: any) =>
  isNegativePattern(pattern)
    ? '!' + path.posix.join(base, pattern.slice(1))
    : path.posix.join(base, pattern);

const parseIgnoreFile = (file: any, cwd: string) => {
  const base = slash(path.relative(cwd, path.dirname(file.filePath)));

  return file.content
    .split(/\r?\n/)
    .filter((line: string) => line && !line.startsWith('#'))
    .map((pattern: string) => applyBaseToPattern(pattern, base));
};

const toRelativePath = (fileOrDirectory: string, cwd: string) => {
  cwd = slash(cwd);
  if (path.isAbsolute(fileOrDirectory)) {
    if (slash(fileOrDirectory).startsWith(cwd)) {
      return path.relative(cwd, fileOrDirectory);
    }

    throw new Error(`Path ${fileOrDirectory} is not in cwd ${cwd}`);
  }

  return fileOrDirectory;
};

const getIsIgnoredPredicate = (files: any[], cwd: string) => {
  const patterns = files.flatMap((file) => parseIgnoreFile(file, cwd));
  const ignores = ignore.add(patterns);

  return (fileOrDirectory: string) => {
    fileOrDirectory = toPath(fileOrDirectory);
    fileOrDirectory = toRelativePath(fileOrDirectory, cwd);
    return fileOrDirectory ? ignores.ignores(slash(fileOrDirectory)) : false;
  };
};

const normalizeOptions = (options: any = {}) => ({
  cwd: toPath(options.cwd) ?? process.cwd(),
  suppressErrors: Boolean(options.suppressErrors),
  deep:
    typeof options.deep === 'number' ? options.deep : Number.POSITIVE_INFINITY,
});

export const isIgnoredByIgnoreFiles = async (
  patterns: string[] | string,
  options: any,
) => {
  const { cwd, suppressErrors, deep } = normalizeOptions(options);

  const paths = await fastGlob(patterns, {
    cwd,
    suppressErrors,
    deep,
    ...ignoreFilesGlobOptions,
  });

  const files = await Promise.all(
    paths.map(async (filePath) => ({
      filePath,
      content: await fsPromises.readFile(filePath, 'utf8'),
    })),
  );

  return getIsIgnoredPredicate(files, cwd);
};

export const isIgnoredByIgnoreFilesSync = (
  patterns: string[] | string,
  options: any,
) => {
  const { cwd, suppressErrors, deep } = normalizeOptions(options);

  const paths = fastGlob.sync(patterns, {
    cwd,
    suppressErrors,
    deep,
    ...ignoreFilesGlobOptions,
  });

  const files = paths.map((filePath) => ({
    filePath,
    content: fs.readFileSync(filePath, 'utf8'),
  }));

  return getIsIgnoredPredicate(files, cwd);
};

export const isGitIgnored = (options: any) =>
  isIgnoredByIgnoreFiles(GITIGNORE_FILES_PATTERN, options);
export const isGitIgnoredSync = (options: any) =>
  isIgnoredByIgnoreFilesSync(GITIGNORE_FILES_PATTERN, options);
