'use strict';

const _ = require('lodash');
const GetStoreFixture = require('./fixtures/store');

exports.get = jest.fn(async (options, id) => {
  if (id == 'store-no-contents-id') {
    return _.merge({}, GetStoreFixture, {contents: null});
  }
  return GetStoreFixture;
});
