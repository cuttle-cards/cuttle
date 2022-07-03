module.exports = {
  compilerOptions: {
    target: 'esnext',
    module: 'esnext',
    strict: false,
    jsx: 'preserve',
    moduleResolution: 'node',
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    forceConsistentCasingInFileNames: true,
    useDefineForClassFields: true,
    sourceMap: true,
    baseUrl: '.',
    types: ['webpack-env', 'jest'],
    // Must match alias definitions in vue.config.js
    paths: {
      '@/*': ['client/js/*'],
    },
    lib: ['esnext', 'dom', 'dom.iterable', 'scripthost'],
    // Must be set to true (and eslint no unused vars turned off) in order to use <script setup> syntax
    noUnusedLocals: true,
    // Recommended for when we switch to using vite
    // isolatedModules: true,
  },
  vueCompilerOptions: {
    target: 2.7,
  },
  include: [
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.vue',
    'tests/**/*.ts',
    'tests/**/*.tsx',
    'client/js/shims-tsx.d.ts',
  ],
  exclude: ['node_modules'],
};
