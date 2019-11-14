'use strict';

const Querystring = require('querystring');

const Service = require('../service');

const internals = {
  microservice: 'users'
};


exports.get = async function(options, path, query) {
  return await Service.get(options, internals.microservice, path);
};