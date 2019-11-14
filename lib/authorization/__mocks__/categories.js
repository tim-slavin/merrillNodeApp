'use strict';

const GetCategoryFixture = require('./fixtures/category');

exports.get = jest.fn(() => Promise.resolve(GetCategoryFixture));
