'use strict';

const _ = require('lodash');

const internals = {};

exports.delete = async function(options, microservice, path) {
  const {url, headers} = internals.getHeadersAndUrl(options, microservice, path);

  const opts = {headers};

  const {payload} = await options.request.wreck.delete(url, opts);

  return payload;
};

exports.get = async function(options, microservice, path) {
  const {url, headers} = internals.getHeadersAndUrl(options, microservice, path);

  const opts = {headers};

  const {payload} = await options.request.wreck.get(url, opts);

  return payload;
};

exports.post = async function(options, microservice, path, postPayload) {
  const {url, headers} = internals.getHeadersAndUrl(options, microservice, path);

  const opts = {headers, payload: postPayload};

  const {payload} = await options.request.wreck.post(url, opts);
  return payload;
};

exports.patch = async function(options, microservice, path, patchPayload) {
  const {url, headers} = internals.getHeadersAndUrl(options, microservice, path);

  const opts = {headers, payload: patchPayload};

  const {payload} = await options.request.wreck.patch(url, opts);

  return payload;
};

exports.put = async function(options, microservice, path, putPayload) {
  const {url, headers} = internals.getHeadersAndUrl(options, microservice, path);

  const opts = {headers, payload: putPayload};

  const {payload} = await options.request.wreck.put(url, opts);

  return payload;
};


internals.getHeadersAndUrl = function(options, microservice, path) {
  const {url, key} = options.context[microservice];

  const headers = _.pickBy({
    'correlation-id': options.request.headers['correlation-id'] || options.request.info.id,
    'accept': 'application/json; charset=utf-8'
  });

  const _url = `${url}${path}`;

  return {headers, url: _url};
};
