'use strict';

const CustomerFixture = require('./fixtures/customer');
const CustomerSettingsFixture = require('./fixtures/customer-settings');

exports.get = jest.fn(() => Promise.resolve(CustomerFixture));
exports.getSettings = jest.fn(() => Promise.resolve(CustomerSettingsFixture));

