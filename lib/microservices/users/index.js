'use strict';

const Querystring = require('querystring');

const Service = require('../service');

const internals = {
  microservice: 'users'
};


exports.get = async function(options, query) {
  const url = `?${Querystring.stringify(query)}`;

  return await Service.get(options, internals.microservice, url);
};