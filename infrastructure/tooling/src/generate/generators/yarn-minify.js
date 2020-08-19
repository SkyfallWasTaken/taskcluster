const minify = require('yarn-minify');
const { gitLsFiles } = require('../../utils');

// Ignore packages while we slowly whittle away the requirements
const IGNORE = {
  'clients/client/yarn.lock': pkg => false,
  'clients/client-web/yarn.lock': pkg => false,
  'yarn.lock': pkg => [
    'acorn',
    'async',
    '@babel/runtime',
    'base64-js',
    'bluebird',
    'body-parser',
    'convert-source-map',
    'graphql-tag',
    '@hapi/hoek',
    'har-validator',
    'is-buffer',
    'is-regex',
    'lodash',
    'mime',
    'mime-db',
    'mock-fs',
    'nodemailer',
    'object-inspect',
    'qs',
    'request',
    'resolve',
    'signal-exit',
    'subscriptions-transport-ws',
    'tslib',
    '@types/node',
    'uuid',
    'zen-observable',
  ].includes(pkg),
  'ui/yarn.lock': pkg => [
    'acorn',
    'ajv',
    'array-includes',
    'async',
    '@babel/code-frame',
    '@babel/compat-data',
    '@babel/core',
    '@babel/generator',
    '@babel/helper-annotate-as-pure',
    '@babel/helper-builder-react-jsx',
    '@babel/helper-builder-react-jsx-experimental',
    '@babel/helper-compilation-targets',
    '@babel/helper-create-class-features-plugin',
    '@babel/helper-define-map',
    '@babel/helper-function-name',
    '@babel/helper-get-function-arity',
    '@babel/helper-hoist-variables',
    '@babel/helper-member-expression-to-functions',
    '@babel/helper-module-imports',
    '@babel/helper-module-transforms',
    '@babel/helper-optimise-call-expression',
    '@babel/helper-plugin-utils',
    '@babel/helper-regex',
    '@babel/helper-replace-supers',
    '@babel/helpers',
    '@babel/helper-simple-access',
    '@babel/helper-split-export-declaration',
    '@babel/helper-validator-identifier',
    '@babel/highlight',
    'babel-loader',
    '@babel/parser',
    '@babel/plugin-proposal-async-generator-functions',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-dynamic-import',
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-unicode-property-regex',
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-syntax-object-rest-spread',
    '@babel/plugin-syntax-top-level-await',
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-transform-block-scoped-functions',
    '@babel/plugin-transform-block-scoping',
    '@babel/plugin-transform-classes',
    '@babel/plugin-transform-computed-properties',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-transform-dotall-regex',
    '@babel/plugin-transform-duplicate-keys',
    '@babel/plugin-transform-exponentiation-operator',
    '@babel/plugin-transform-for-of',
    '@babel/plugin-transform-function-name',
    '@babel/plugin-transform-literals',
    '@babel/plugin-transform-member-expression-literals',
    '@babel/plugin-transform-modules-amd',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-modules-systemjs',
    '@babel/plugin-transform-modules-umd',
    '@babel/plugin-transform-named-capturing-groups-regex',
    '@babel/plugin-transform-new-target',
    '@babel/plugin-transform-object-super',
    '@babel/plugin-transform-parameters',
    '@babel/plugin-transform-property-literals',
    '@babel/plugin-transform-react-display-name',
    '@babel/plugin-transform-react-jsx',
    '@babel/plugin-transform-react-jsx-self',
    '@babel/plugin-transform-react-jsx-source',
    '@babel/plugin-transform-regenerator',
    '@babel/plugin-transform-reserved-words',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-spread',
    '@babel/plugin-transform-sticky-regex',
    '@babel/plugin-transform-template-literals',
    '@babel/plugin-transform-typeof-symbol',
    '@babel/plugin-transform-unicode-regex',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/runtime',
    '@babel/template',
    '@babel/traverse',
    '@babel/types',
    'bluebird',
    'ccount',
    'chokidar',
    'chownr',
    'commander',
    'compressible',
    'compression',
    'convert-source-map',
    'csstype',
    'electron-to-chromium',
    'es-abstract',
    'eslint-loader',
    'eslint-module-utils',
    'eslint-plugin-import',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
    'es-to-primitive',
    'estraverse',
    'eventemitter3',
    'express',
    'faye-websocket',
    'glob',
    'graceful-fs',
    'history',
    'hoist-non-react-statics',
    'http-proxy',
    'is-callable',
    'is-regex',
    'iterall',
    'json5',
    'jsx-ast-utils',
    'js-yaml',
    'loader-utils',
    'loglevel',
    '@material-ui/utils',
    'mime-db',
    'mkdirp',
    'object.entries',
    'object.fromentries',
    'object-inspect',
    'object.values',
    'on-headers',
    'opn',
    'optionator',
    'parse-entities',
    'p-limit',
    'portfinder',
    'postcss',
    'postcss-value-parser',
    'react-is',
    'readable-stream',
    'regenerate',
    'regenerator-runtime',
    'regexp.prototype.flags',
    'regexpu-core',
    'regjsgen',
    'resolve',
    'rimraf',
    'schema-utils',
    'selfsigned',
    'source-map-support',
    'string.prototype.trimleft',
    'string.prototype.trimright',
    'terser',
    'tslib',
    '@types/node',
    '@types/react',
    'unist-util-visit',
    'url-parse',
    'ws',
  ].includes(pkg),
  'workers/docker-worker/yarn.lock': pkg => [
    'ajv',
    'brace-expansion',
    'chownr',
    'debug',
    'end-of-stream',
    'glob',
    'inherits',
    'ipaddr.js',
    'js-yaml',
    'mime-types',
    'minimatch',
    'readable-stream',
    'safe-buffer',
    'which',
  ].includes(pkg),
};

exports.tasks = [{
  title: 'Minify yarn.locks',
  provides: ['target-yarn-minify'],
  run: async (requirements, utils) => {
    let yarnlocks = (await gitLsFiles())
      .filter(file => file === 'yarn.lock' || file.endsWith('/yarn.lock'));

    for (let filename of yarnlocks) {
      minify(filename, { ignore: IGNORE[filename] });
    }
  },
}];