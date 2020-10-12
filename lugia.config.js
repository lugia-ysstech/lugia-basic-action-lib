import { join } from 'path';
const tsImportPluginFactory = require('ts-import-plugin');
const monacoWebpackPlugin = require('monaco-editor-webpack-plugin');

export default {
  disableCSSModules: true,
  cssModulesWithAffix: true,
  entry: './src/index.tsx',
  publicPath: '/',
  alias: {
    '@': join(__dirname, './src'),
  },
  extraBabelIncludes: [/decamelize/],
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: '@lugia/lugia-web',
        libraryDirectory: 'dist',
      },
      '@lugia/lugia-web',
    ]
  ],
  applyWebpack(webpackConfig, { webpack, merge }) {
    webpackConfig.module.rules.push({
      test: /\.(tsx|ts)$/,
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        getCustomTransformers: () => ({
          before: [
            tsImportPluginFactory([
              {
                libraryName: '@lugia/lugia-web',
                libraryDirectory: 'dist',
              },
              {
                libraryName: '@lugia/lugia-mega-ui',
                libraryDirectory: 'dist',
              },
            ]),
          ],
        }),
        compilerOptions: {
          module: 'es2015',
        },
      },
      exclude: /node_modules/,
    });
    webpackConfig.plugins.push(new monacoWebpackPlugin());
    return webpackConfig;
  },
  dllDependenciesExcludes: ['@lugia/lugia-web'],
};
