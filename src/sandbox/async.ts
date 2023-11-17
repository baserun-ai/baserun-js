import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<{ name?: string }>();

// function functionA() {
//   const context = asyncLocalStorage.getStore();
//   context.functionACalled = true;
// }

// function functionB() {
//   const context = asyncLocalStorage.getStore();
//   if (context.functionACalled) {
//     console.log('functionA was called in the same execution context');
//   } else {
//     console.log('functionA was not called in the same execution context');
//   }
// }

// asyncLocalStorage.run(new Map(), () => {
//   functionA();
//   functionB();
// });

function trace(cb: () => Promise<void>, name: string) {
  return asyncLocalStorage.run({}, async () => {
    const context = asyncLocalStorage.getStore();
    if (context) {
      context.name = name;
    }
    await cb();
  });
}

function log(message: string) {
  const context = asyncLocalStorage.getStore();
  console.log('context', message, context);
}

async function main() {
  await Promise.all([
    trace(async () => {
      log('1');
    }, 'trace 1'),
    trace(async () => {
      log('2');
    }, 'trace 2'),
  ]);
}

main();
