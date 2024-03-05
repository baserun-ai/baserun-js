/* eslint-disable @typescript-eslint/ban-ts-comment */
import url from 'url';

import path from 'node:path';
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import resolvePkg from 'resolve-pkg';
import getDebug from 'debug';
import resolve from 'resolve';
// @ts-ignore
import {
  packageDirectorySync,
  packageDirectory,
  // @ts-ignore
} from '../lib/pkg-dir/index.js';
// @ts-ignore
import { globby, globbySync } from '../lib/globby/index.js';

const debug = getDebug('baserun:resolveAll');

// I'd really not like to do this
// Thank you Node.js
// We do this because we want to support a commonjs build

// resolves all occurrences of a module name in the current project
export function resolveAllSync(moduleName: string): string[] {
  const paths = new Set<string>([]);

  const naive = require.resolve(moduleName);

  if (naive) {
    paths.add(naive);
  }

  let currentDir = process.cwd();
  while (currentDir.split(path.sep).length > 2) {
    const pkgDir = packageDirectorySync({ cwd: currentDir });

    if (pkgDir) {
      debug({ currentDir, pkgDir });
      const packageJsonPath = path.join(pkgDir, 'package.json');

      resolveFromPackageSync(packageJsonPath, moduleName, paths);

      // we go two levels deep because we want to catch packages/package-name/
      globbySync(['**/package.json', '!node_modules'], {
        cwd: pkgDir,
        deep: 2,
        expandDirectories: {
          files: ['package.json'],
        },
        suppressErrors: true,
      }).forEach((p: any) => {
        resolveFromPackageSync(p, moduleName, paths);
      });
    }

    currentDir = path.dirname(currentDir);
  }

  debug(paths);

  return Array.from(paths);
}

function resolveFromPackageSync(
  packageJsonPath: string,
  moduleName: string,
  paths: Set<string>,
) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg?.dependencies) {
      const deps = Object.keys(pkg.dependencies).filter(filterPackage);
      for (const dep of deps) {
        if (dep === moduleName) {
          try {
            const mod = resolve.sync(moduleName, { basedir: packageJsonPath });
            if (mod) {
              paths.add(mod);
            }
          } catch (e) {
            debug(e);
            // fail silently
          }
          continue;
        }
        try {
          const resolved = resolvePkg(dep, {
            cwd: path.dirname(packageJsonPath),
          });
          if (resolved) {
            try {
              const mod = resolve.sync(moduleName, { basedir: resolved });
              if (mod) {
                paths.add(mod);
              }
            } catch (e) {
              debug(e);
              // fail silently
            }
          }
        } catch (e) {
          debug(e);
        }
      }
    }
  } catch (e) {
    debug(e);
    // fail silently
  }

  return Array.from(paths);
}

export async function resolveAll(moduleName: string): Promise<string[]> {
  const paths = new Set<string>([]);

  const naive = require.resolve(moduleName);

  if (naive) {
    paths.add(url.fileURLToPath(naive));
  }

  const pkgDir = await packageDirectory();
  if (pkgDir) {
    const packageJsonPath = path.join(pkgDir, 'package.json');

    await Promise.all([
      resolveFromPackage(packageJsonPath, moduleName, paths),
      (async () => {
        const files = await globby(['**/package.json', '!node_modules'], {
          cwd: pkgDir,
          deep: 2,
          expandDirectories: {
            files: ['package.json'],
          },
          suppressErrors: true,
        });

        await Promise.all(
          files.map(async (p: any) => {
            await resolveFromPackage(p, moduleName, paths);
          }),
        );
      })(),
    ]);
  }

  return Promise.resolve(Array.from(paths));
}

async function resolveFromPackage(
  packageJsonPath: string,
  moduleName: string,
  paths: Set<string>,
) {
  try {
    const pkg = JSON.parse(await fsPromise.readFile(packageJsonPath, 'utf8'));
    if (pkg?.dependencies) {
      const deps = Object.keys(pkg.dependencies).filter(filterPackage);
      for (const dep of deps) {
        try {
          const resolved = resolvePkg(dep, {
            cwd: path.dirname(packageJsonPath),
          });
          if (resolved) {
            try {
              const mod = resolve.sync(moduleName, { basedir: resolved });
              if (mod) {
                paths.add(mod);
              }
            } catch (e) {
              debug(e);
              // fail silently
            }
          }
        } catch (e) {
          debug(e);
        }
      }
    }
  } catch (e) {
    debug(e);
    // fail silently
  }

  return Array.from(paths);
}

function filterPackage(pkg: string) {
  return !pkg.startsWith('@types');
}
