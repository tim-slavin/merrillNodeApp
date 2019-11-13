'use strict';

const Joi = require('@hapi/joi');

const _ = require('lodash');

const Users = require('../../managers/users');

exports.get = {
  description: 'Get the current list of users',
  tags: ['api'],
  validate: {},
  handler: async function(request, h) {
    const options = {request, context: h.context};

    return await Users.get(options);
  }
};
