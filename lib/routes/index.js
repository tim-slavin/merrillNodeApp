'use strict';

const Users = require('./users');

module.exports = [
  {
    path: '/users/registered',
    method: 'GET',
    config: Users.Users.get
  }
];
