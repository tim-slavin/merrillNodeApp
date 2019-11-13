// 'use strict';

// /* istanbul ignore file */

// const _ = require('lodash');
// const Services = require('../services');
// const Env = require('../env');

// const internals = {};

// internals.init = function() {
//   const graylogUrl = _.get(Services[Env], 'graylog.url');

//   if (_.isEmpty(graylogUrl)) {
//     return {};
//   }

//   return {
//     reporters: {
//       activityReporter: [{
//         module: '@hapi/good-squeeze',
//         name: 'Squeeze',
//         args: [{request: '*', error: '*', response: '*', log: '*', wreck: '*'}]
//       },
//       {
//         module: '@taylordigital/good-gelf',
//         args: [
//           graylogUrl,
//           {
//             short_message: `${Env}-klic-api`,
//             application: {
//               name: 'klic-api',
//               environment: Env
//             }
//           }
//         ]
//       }]
//     }
//   };
// };

// module.exports = internals.init();
