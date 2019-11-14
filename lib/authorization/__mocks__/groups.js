'use strict';

const GroupFixture = require('./fixtures/group');


exports.get = jest.fn(() => Promise.resolve(GroupFixture));
