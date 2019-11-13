'use strict';

const _ = require('lodash');
const Services = require('../services');
const Package = require('../../../package');
const Env = require('../env');

const settings = {
  info: {
    title: 'KLIC API Documentation',
    version: Package.version
  },
  securityDefinitions: {
    'Authorization': {
      description: 'TAAS token. Enter the string in the following format: Bearer ${token from TAAS}',
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  },
  security: [{'Authorization': []}]
};
/* istanbul ignore next */
if (process.env.NODE_ENV && _.get(Services[Env], 'useRouteVersioning', false)) {
  _.assign(settings, {
    basePath: `/v${_.head(Package.version)}/`,
    jsonPath: `/v${_.head(Package.version)}/swagger.json`,
    swaggerUIPath: `/v${_.head(Package.version)}/swaggerui/`,
    documentationPath: `/v${_.head(Package.version)}/documentation`,
    pathPrefixSize: 2
  });
}

module.exports = settings;
