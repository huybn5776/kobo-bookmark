/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';

import svgLoader from 'vite-svg-loader';
import vue from '@vitejs/plugin-vue';
import { defineConfig, Alias } from 'vite';

import * as tsconfig from './tsconfig.json';

function readAliasFromTsConfig(): Alias[] {
  return Object.entries(tsconfig.compilerOptions.paths).reduce((aliases, [fromPaths, toPaths]) => {
    const find = fromPaths.replace(/\/\*$/, '');
    const toPath = toPaths[0].replace(/\/\*$/, '').replace('client/', '');
    const replacement = path.resolve(__dirname, toPath);
    aliases.push({ find, replacement });
    return aliases;
  }, [] as Alias[]);
}

export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: readAliasFromTsConfig(),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        followRedirects: true,
      },
    },
  },
});
