'use strict';

exports.get = async function(options, id) {
  const wreck = options.request.wreck;
  const url = `${options.context.groups.url}/v1/Groups/${id}`;
  const opts = {
    headers: {
      'KlicMicroserviceApiKey': options.context.groups.key,
      'correlation-id': options.request.headers['correlation-id'] || options.request.info.id
    }
  };

  const {payload} = await wreck.get(url, opts);

  return payload;
};
