const Encore = require('@symfony/webpack-encore');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

// Update environmental variable with .env* files
dotenv.config({override: true, path: './.env'}).parsed;
dotenv.config({override: true, path: './.env.local'}).parsed;

const path = process.env.PUBLIC_URL || '';
const prefix = path.startsWith('/') ? path.substr(1) : path;

Encore
  // directory where compiled assets will be stored
  .setOutputPath('public/build/')
  // public path used by the web server to access the output path
  .setPublicPath(`${path}/build`)
  // only needed for CDN's or sub-directory deploy
  .setManifestKeyPrefix(prefix)

  /*
   * ENTRY CONFIG
   *
   * Each entry will result in one JavaScript file (e.g. app.js)
   * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
   */
  .addEntry('js/accountCreator', './assets/userCreator.js')
  .addEntry('js/installer', './assets/installer.js')
  .addEntry('js/app', './assets/app.js')
  .addStyleEntry('css/app', ['./assets/styles/app.scss'])

  // enables the Symfony UX Stimulus bridge (used in assets/bootstrap.js)
  // .enableStimulusBridge('./assets/controllers.json')

  // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
  // .splitEntryChunks()

  // will require an extra script tag for runtime.js
  // but, you probably want this, unless you're building a single-page app
  // .enableSingleRuntimeChunk()
  .disableSingleRuntimeChunk()

  /*
   * FEATURE CONFIG
   *
   * Enable & configure other features below. For a full
   * list of features, see:
   * https://symfony.com/doc/current/frontend.html#adding-more-features
   */
  .cleanupOutputBeforeBuild()
  .enableBuildNotifications()
  .enableSourceMaps(!Encore.isProduction())
  // enables hashed filenames (e.g. app.abc123.css)
  .enableVersioning(Encore.isProduction())

  .configureBabel((config) => {
    config.plugins.push('@babel/plugin-proposal-class-properties', '@babel/plugin-syntax-jsx');
  })

  // enables @babel/preset-env polyfills
  .configureBabelPresetEnv((config) => {
    config.useBuiltIns = 'usage';
    config.corejs = 3;
  })

  // enables Sass/SCSS support
  .enableSassLoader()
  .configureCssLoader((options) => {
    options.modules = true;
  })
  // uncomment if you use TypeScript
  //.enableTypeScriptLoader()

  // uncomment if you use React
  .enableReactPreset()

  // uncomment to get integrity="..." attributes on your script & link tags
  // requires WebpackEncoreBundle 1.4 or higher
  //.enableIntegrityHashes(Encore.isProduction())

  // uncomment if you're having problems with a jQuery plugin
  //.autoProvidejQuery()

  .addPlugin(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  );

module.exports = Encore.getWebpackConfig();
