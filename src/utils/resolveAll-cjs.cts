/* eslint-disable @typescript-eslint/ban-ts-comment */
import url from 'url';

import path from 'node:path';
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import resolvePkg from 'resolve-pkg';

// I'd really not like to do this
// Thank you Node.js
// We do this because we want to support a commonjs build
async function getESModules() {
  const [
    { resolve },
    { packageDirectory, packageDirectorySync },
    { globby, globbySync },
  ] = await Promise.all([
    import('import-meta-resolve'),
    import('pkg-dir'),
    import('globby'),
  ]);

  return {
    resolve,
    packageDirectory,
    packageDirectorySync,
    globby,
    globbySync,
  };
}

const modulesPromise = getESModules();

// resolves all occurrences of a module name in the current project
export async function resolveAllSync(moduleName: string): Promise<string[]> {
  const { packageDirectorySync, globbySync } = await modulesPromise;
  const paths = new Set<string>([]);

  const naive = require.resolve(moduleName);

  if (naive) {
    paths.add(naive);
  }

  const pkgDir = packageDirectorySync();
  if (pkgDir) {
    const packageJsonPath = path.join(pkgDir, 'package.json');

    resolveFromPackageSync(packageJsonPath, moduleName, paths);

    // we go two levels deep because we want to catch packages/package-name/
    globbySync(['**/package.json', '!node_modules'], {
      cwd: pkgDir,
      deep: 2,
      expandDirectories: {
        files: ['package.json'],
      },
    }).forEach((p) => {
      resolveFromPackageSync(p, moduleName, paths);
    });
  }

  return Array.from(paths);
}

async function resolveFromPackageSync(
  packageJsonPath: string,
  moduleName: string,
  paths: Set<string>,
) {
  try {
    const { resolve } = await modulesPromise;
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
            console.error(e);
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
              console.error(e);
              // fail silently
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  } catch (e) {
    console.error(e);
    // fail silently
  }

  return Array.from(paths);
}

export async function resolveAll(moduleName: string): Promise<string[]> {
  const { globby, packageDirectory } = await modulesPromise;
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
        });

        await Promise.all(
          files.map(async (p) => {
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
  const { resolve } = await modulesPromise;
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
              console.error(e);
              // fail silently
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  } catch (e) {
    console.error(e);
    // fail silently
  }

  return Array.from(paths);
}

function filterPackage(pkg: string) {
  return !pkg.startsWith('@types');
}
