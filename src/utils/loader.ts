export function loadModule(mod: any, name: string): Promise<any> {
  if (mod.require) {
    return mod.require(name);
  } else {
    return require(name);
  }
}
