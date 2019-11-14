'use strict';

const GetUserFixture = require('./fixtures/user');
const GetAdminFixture = require('./fixtures/admin');
const GetCartsFixture = require('./fixtures/carts');


exports.get = jest.fn(async (opts, userId) => {
  if (userId === '8b1108bf-9502-4968-9453-c7177533ce02') {
    return GetAdminFixture;
  }
  return GetUserFixture;
});

exports.getCarts = jest.fn(() => Promise.resolve(GetCartsFixture));
