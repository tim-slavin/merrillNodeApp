'use strict';

const _ = require('lodash');
const Boom = require('@hapi/boom');


exports.anonymousOrBearerAccessToken = function(server, options) {
  return {
    authenticate: async (request, h) => {
      const authenticateAuthorization = async function(authorization) {
        const parts = authorization.split(/\s+/);
        if (parts[0].toLowerCase() !== 'bearer') {
          return h.unauthenticated(Boom.unauthorized('Invalid access token type'));
        }

        const token = parts[1];

        const {isValid, credentials, artifacts} = await options.validateUserFunc(request, token, h);

        if (isValid) {
          return h.authenticated({credentials, artifacts});
        }

        return h.unauthenticated(Boom.unauthorized(), {credentials});
      };

      const authenticateAnonymous = async function() {
        const {isValid, credentials, artifacts} = await options.validateAnonymousFunc(request, {}, h);
        _.assign(credentials, {isAnonymous: true});

        if (isValid) {
          return h.authenticated({credentials, artifacts});
        }

        return h.unauthenticated(Boom.unauthorized(), {credentials});
      };

      const authorization = _.get(request, 'raw.req.headers.authorization');

      if (authorization) {
        return await authenticateAuthorization(authorization);
      }

      return await authenticateAnonymous();
    }
  };
};
