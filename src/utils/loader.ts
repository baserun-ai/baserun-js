export function loadModule(mod: any, name: string): Promise<any> {
  return import(name);
  // need to double check if this actually works
  import(name).then((mod) => {
    console.log('imported', mod);
  });

  // if (mod && typeof mod.require !== 'undefined') {
  const required = mod.require(name);
  console.log('required', required);
  return Promise.resolve(required);
  // }
}
