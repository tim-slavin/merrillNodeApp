'use strict';

const GetWorkflowFixture = require('./fixtures/workflow');


exports.get = jest.fn(() => Promise.resolve(GetWorkflowFixture));
