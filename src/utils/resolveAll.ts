// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { resolve } from 'import-meta-resolve';
import url from 'url';
import {
  packageDirectorySync,
  packageDirectory,
} from '../lib/pkg-dir/index.js';
import path from 'node:path';
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import resolvePkg from 'resolve-pkg';
import { globby, globbySync } from '../lib/globby/index.js';
import getDebug from 'debug';
import { pathToFileURL } from 'url';
const debug = getDebug('baserun:resolveAll');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const importMetaUrl = import.meta?.url || pathToFileURL(__filename);

// resolves all occurrences of a module name in the current project
export function resolveAllSync(moduleName: string): string[] {
  // we definitely want to at least patch the moduleName itself
  const paths = new Set<string>([moduleName]);

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const naive = resolve(moduleName, importMetaUrl);

    if (naive) {
      paths.add(url.fileURLToPath(naive));
    }

    let currentDir = process.cwd();

    let count = 0;
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
        }).forEach((p: any) => {
          resolveFromPackageSync(p, moduleName, paths);
        });
      }

      currentDir = path.dirname(currentDir);
      if (count++ > 3) {
        break;
      }
    }
  } catch (e) {
    debug(e);
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
            const ur = url.pathToFileURL(packageJsonPath).toString();
            const mod = resolve(moduleName, ur);
            if (mod) {
              paths.add(url.fileURLToPath(mod));
            }
          } catch (e) {
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
              const ur = url.pathToFileURL(resolved).toString();
              const mod = resolve(moduleName, ur);
              if (mod) {
                paths.add(url.fileURLToPath(mod));
              }
            } catch (e) {
              // fail silently
            }
          }
        } catch (e) {
          debug(e);
        }
      }
    }
  } catch (e) {
    // fail silently
  }

  return Array.from(paths);
}

export async function resolveAll(moduleName: string): Promise<string[]> {
  const paths = new Set<string>([]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const naive = resolve(moduleName, importMetaUrl);

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
              const ur = url.pathToFileURL(resolved).toString();
              const mod = resolve(moduleName, ur);
              if (mod) {
                paths.add(url.fileURLToPath(mod));
              }
            } catch (e) {
              // fail silently
            }
          }
        } catch (e) {
          debug(e);
        }
      }
    }
  } catch (e) {
    // fail silently
  }

  return Array.from(paths);
}

function filterPackage(pkg: string) {
  return !pkg.startsWith('@types');
}
