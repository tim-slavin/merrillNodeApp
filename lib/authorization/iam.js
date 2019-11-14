'use strict';

const _ = require('lodash');
const Async = require('async');
const Boom = require('@hapi/boom');
const Querystring = require('querystring');


exports.getUserInfo = async function(opts, token) {
  const wreck = opts.request.wreck;

  const getUser = async function() {
    const url = `${opts.context.iam.url}/connect/userinfo`;
    const options = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'correlation-id': opts.request.headers['correlation-id'] || opts.request.info.id,
        'accept': 'application/json; charset=utf-8'
      },
      json: true
    };

    const {res, payload} = await wreck.get(url, options);

    if (res.statusCode === 200) {
      return payload;
    }

    throw Boom.unauthorized();
  };

  const introspectToken = async function() {
    const url = `${opts.context.iam.url}/connect/introspect`;
    const options = {
      headers: {
        'Authorization': `Basic ${opts.context.iam.key}`,
        'content-type': 'application/x-www-form-urlencoded',
        'correlation-id': opts.request.headers['correlation-id'] || opts.request.info.id
      },
      payload: Querystring.stringify({token}),
      json: true
    };

    const {res, payload} = await wreck.post(url, options);

    if (res.statusCode === 200) {
      const isActive = _.get(payload, 'active', {default: false});

      if (isActive) {
        const scope = _.get(payload, 'scope', {default: ''});
        const isValidScope = scope.includes('tc_klic_api');

        if (isValidScope) {
          return payload;
        }
      }
    }

    throw Boom.unauthorized();
  };

  const getCustomerIds = function({user}, next) {
    if (typeof user.TC_OrgID === 'string') {
      return next(null, [user.TC_OrgID]);
    }

    if (_.isArray(user.TC_OrgID )) {
      return next(null, user.TC_OrgID);
    }

    opts.request.log(['iam', 'userinfo', 'error'], {
      message: 'TC_OrgID is neither a string nor an Array',
      TC_OrgID: user.TC_OrgID
    });

    return next(Boom.unauthorized());
  };

  const {user, customerIds} = await Async.auto({
    user: getUser,
    introspect: introspectToken,
    customerIds: ['user', getCustomerIds]
  });

  return {
    email: user.email,
    userId: user.sub,
    firstName: user.given_name,
    lastName: user.family_name,
    customerIds
  };
};

