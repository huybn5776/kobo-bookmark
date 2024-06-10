/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';

import svgLoader from 'vite-svg-loader';
import vue from '@vitejs/plugin-vue';
import { PreRenderedAsset } from 'rollup';
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

function handleRenamePlaygroundJson(asset: PreRenderedAsset): string | null {
  if (asset.name?.startsWith('playground-books_')) {
    const [filename, localeAndExtName] = asset.name.split('_');
    const [locale, extName] = localeAndExtName.split('.');
    return `intro/${locale}/${filename}.${extName}`;
  }
  return null;
}

function handleRenameAsset(asset: PreRenderedAsset): string | null {
  switch (asset.name?.split('.').pop()) {
    case 'css':
      return `css/[name]-[hash][extname]`;
    case 'png':
    case 'jpg':
    case 'ico':
    case 'svg':
      return 'images/[name]-[hash][extname]';
    default:
      return null;
  }
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
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (asset) => {
          return handleRenamePlaygroundJson(asset) || handleRenameAsset(asset) || 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
