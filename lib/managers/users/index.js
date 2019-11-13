'use strict';

const _ = require('lodash');
const Async = require('async');
const Boom = require('@hapi/boom');

const Users = require('../../microservices/users');


exports.get = async function(options, query) {
  return await Users.get(options, query);
};