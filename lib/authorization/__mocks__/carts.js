'use strict';

const GetCartFixture = require('./fixtures/cart');

exports.get = jest.fn(() => Promise.resolve(GetCartFixture));
