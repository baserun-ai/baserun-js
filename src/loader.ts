export function loadModule(mod: any, name: string): any {
  return mod.require(name);
}
