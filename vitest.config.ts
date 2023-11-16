import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/vitests/*.test.ts'],
  },
  plugins: [
    // {
    //   name: 'whoooot',
    //   config: () => ({
    //     test: {
    //       setupFiles: ['./src/vitest/setup.ts'],
    //     },
    //   }),
    // },
  ],
});
