'use strict';

exports.get = async function(options, id) {
  const wreck = options.request.wreck;
  const url = `${options.context.customers.url}/${id}`;
  const opts = {
    headers: {
      'KlicMicroserviceApiKey': options.context.customers.key,
      'correlation-id': options.request.headers['correlation-id'] || options.request.info.id
    }
  };

  const {payload} = await wreck.get(url, opts);

  return payload;
};

exports.getSettings = async function(options, id) {
  const wreck = options.request.wreck;
  const url = `${options.context.customers.url}/${id}/settings`;
  const opts = {
    headers: {
      'KlicMicroserviceApiKey': options.context.customers.key,
      'correlation-id': options.request.headers['correlation-id'] || options.request.info.id
    }
  };

  const {payload} = await wreck.get(url, opts);

  return payload;
};


