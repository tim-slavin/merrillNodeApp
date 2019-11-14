'use strict';

exports.get = async function(options, taylorCustomerId, id) {
  const wreck = options.request.wreck;
  const url = `${options.context.workflows.url}/customers/${taylorCustomerId}/workflows/${id}`;
  const opts = {
    headers: {
      'KlicMicroserviceApiKey': options.context.workflows.key,
      'correlation-id': options.request.headers['correlation-id'] || options.request.info.id
    }
  };

  const {payload} = await wreck.get(url, opts);

  return payload;
};
