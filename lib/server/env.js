'use strict';

module.exports = require('get-env')({
  // staging: ['staging', 'stage'],
  // integration: ['integration', 'integrate', 'integ'],
  test: ['test', 'testing'],
  jest: ['jest']
});