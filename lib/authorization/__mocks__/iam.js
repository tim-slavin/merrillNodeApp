'use strict';

const _ = require('lodash');
const UserInfoFixture = require('./fixtures/iam-userinfo');


exports.getUserInfo = jest.fn(async (opts, token) => {
  if (token === 'my-admin-token') {
    return _.merge({}, UserInfoFixture, {userId: '8b1108bf-9502-4968-9453-c7177533ce02'});
  }

  return UserInfoFixture;
});
