'use strict';

// const Good = require('@hapi/good');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Wreck = require('@hapi/wreck');
const HapiSwagger = require('hapi-swagger');
const AuthBearer = require('hapi-auth-bearer-token');

const Env = require('../env');
// const GoodOptions = require('./good');
const SwaggerOptions = require('./swagger');

/* istanbul ignore next */
module.exports = Env === 'jest' ? [AuthBearer, Wreck] : [
  AuthBearer,
  Wreck,
  Inert,
  Vision,
  {
    plugin: HapiSwagger,
    options: SwaggerOptions
  }
  // {
  //   plugin: Good,
  //   options: GoodOptions
  // }
];
