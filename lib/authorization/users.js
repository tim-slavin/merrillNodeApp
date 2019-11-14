'use strict';

exports.get = async function(options, id) {
  const wreck = options.request.wreck;
  const url = `${options.context.users.url}/${id}`;
  const opts = {
    headers: {
      'KlicMicroserviceApiKey': options.context.users.key,
      'correlation-id': options.request.headers['correlation-id'] || options.request.info.id
    }
  };

  const {payload} = await wreck.get(url, opts);

  return payload;
};

exports.getCarts = async function(options, userId) {
  const wreck = options.request.wreck;
  const url = `${options.context.users.url}/${userId}/carts`;
  const opts = {
    headers: {
      'KlicMicroserviceApiKey': options.context.users.key,
      'correlation-id': options.request.headers['correlation-id'] || options.request.info.id
    }
  };

  try {
    const {payload} = await wreck.get(url, opts);
    return payload;
  } catch (error) {
    if (error.output.statusCode === 404) {
      return [];
    }
    throw error;
  }
};

