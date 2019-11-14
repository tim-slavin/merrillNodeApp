'use strict';

const _ = require('lodash');
const Async = require('async');
const Boom = require('@hapi/boom');
const Customers = require('./customers');
const Groups = require('./groups');
const Iam = require('./iam');
const Stores = require('./stores');
const Users = require('./users');
const Workflows = require('./workflows');
const Carts = require('./carts');
const Categories = require('./categories');

const internals = {};


exports.anonymous = function(context) {
  return async function(request, token, h) {
    const customerId = internals.getUserRequestedCustomerId(request);
    const isValid = true;
    const credentials = {customerId};
    const artifacts = {token};

    return {isValid, credentials, artifacts};
  };
};

exports.userCustomer = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const requestedCustomerId = internals.getUserRequestedCustomerId(request);
    const credentials = await internals.getUser(options, token, requestedCustomerId);

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.userStore = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const storeId = request.params.id;

    const credentials = await internals.getUserStore(options, token, storeId);

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.adminStore = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const customerId = request.params.id;
    const storeId = request.params.storeId;

    const credentials = await internals.getAdminStore(options, token, storeId, customerId);

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.admin = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const requestedCustomerId = request.params.id;

    const credentials = await internals.getAdmin(options, token, requestedCustomerId);

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.groupAdmin = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const requestedCustomerId = request.params.id;

    const getAdminCredentials = async function() {
      return await internals.getAdmin(options, token, requestedCustomerId);
    };

    const getGroup = async function() {
      const requestedGroupId = request.params.groupId;
      const group = await Groups.get(options, requestedGroupId);

      if (group.customerId === requestedCustomerId) {
        return group;
      }

      throw Boom.notFound();
    };

    const {adminCredentials, group} = await Async.auto({
      adminCredentials: getAdminCredentials,
      group: getGroup
    });

    const credentials = _.merge({}, adminCredentials, {group});

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.userAdmin = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const requestedCustomerId = request.params.id;

    const getAdminCredentials = async function() {
      return await internals.getAdmin(options, token, requestedCustomerId);
    };

    const getUser = async function() {
      const requestedUserId = request.params.userId;
      const user = await Users.get(options, requestedUserId);

      if (user.taylorCustomerId.indexOf(requestedCustomerId) > -1) {
        return user;
      }

      throw Boom.notFound();
    };

    const {adminCredentials, user} = await Async.auto({
      adminCredentials: getAdminCredentials,
      user: getUser
    });

    const credentials = _.merge({}, adminCredentials, {user});

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.workflowAdmin = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const requestedCustomerId = request.params.id;

    const getAdminCredentials = async function() {
      return await internals.getAdmin(options, token, requestedCustomerId);
    };

    const getWorkflow = async function() {
      const requestedWorkflowId = request.params.workflowId;
      const workflow = await Workflows.get(options, requestedCustomerId, requestedWorkflowId);

      if (workflow.taylorCustomerId === requestedCustomerId) {
        return workflow;
      }

      throw Boom.notFound();
    };

    const _credentials = await getAdminCredentials();
    const workflow = await getWorkflow();

    const credentials = _.merge({}, _credentials, {workflow});

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.categoryAdmin = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const requestedCustomerId = request.params.id;
    const requestedCategoryId = request.params.categoryId;

    const getAdminCredentials = async function() {
      return await internals.getAdmin(options, token, requestedCustomerId);
    };

    const getCategory = async function() {
      return await Categories.get(options, requestedCategoryId);
    };

    const getStore = async function({adminCredentials, category}) {
      const store = await Stores.get(options, adminCredentials.customer.defaultStore);

      const isValid = _.chain(store.topCategories).concat(store.includedSubcategories).includes(category.id).value();

      if (isValid) {
        return store;
      }

      throw Boom.notFound();
    };

    const {adminCredentials, category, store} = await Async.auto({
      adminCredentials: getAdminCredentials,
      category: getCategory,
      store: ['adminCredentials', 'category', getStore]
    });

    const credentials = _.merge({}, adminCredentials, {category, store});

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.userCart = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const requestedCustomerId = internals.getRequestedCustomerId(request);

    const credentials = await internals.getCart(options, token, requestedCustomerId);

    return {isValid: true, credentials, artifacts: {token}};
  };
};

exports.anonymousCart = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const cartId = request.params.id;
    const requestedCustomerId = internals.getRequestedCustomerId(request);

    if (requestedCustomerId) {
      const cart = await Carts.get(options, cartId);
      const store = await internals.getAnonymousStore(options, requestedCustomerId, cart.storeId);

      const credentials = {cart, store, customerId: requestedCustomerId};

      return {isValid: true, credentials, artifacts: {token}};
    }

    throw Boom.unauthorized();
  };
};

exports.anonymousStore = function(context) {
  return async function(request, token, h) {
    const options = {context, request};
    const storeId = request.params.id;
    const requestedCustomerId = internals.getRequestedCustomerId(request);

    const store = await internals.getAnonymousStore(options, requestedCustomerId, storeId);
    const credentials = {store, customerId: store.taylorCustomerId};

    return {isValid: true, credentials, artifacts: {token}};
  };
};

internals.getCustomerId = async function(options, requestedCustomerId, customerIds, customer) {
  if (requestedCustomerId) {
    if (customerIds.indexOf(requestedCustomerId) > -1) {
      return requestedCustomerId;
    }

    const {masterTaylorCustomerId} = customer ? customer : await Customers.get(options, requestedCustomerId);

    if (customerIds.indexOf(masterTaylorCustomerId) > -1) {
      return requestedCustomerId;
    }

    throw Boom.notFound('Requested customer not found');
  }

  if (customerIds.length === 1) {
    return customerIds[0];
  }

  return _.chain(customerIds).without('1000').head().value();
};

internals.getRequestedCustomerId = function(request) {
  return _.get(request, 'headers.customer') || _.get(request, 'state.customer');
};

internals.getUserRequestedCustomerId = function(request) {
  return _.get(request, 'query.customerId') || internals.getRequestedCustomerId(request);
};

internals.getRoles = async function(options, userId) {
  const {roles} = await Users.get(options, userId);
  return roles;
};

internals.getUser = async function(options, token, requestedCustomerId, customer) {
  const getCredentials = async function() {
    return await Iam.getUserInfo(options, token);
  };

  const getCustomerId = async function({credentials}) {
    return await internals.getCustomerId(options, requestedCustomerId, credentials.customerIds, customer);
  };

  const getRoles = async function({credentials}) {
    return await internals.getRoles(options, credentials.userId);
  };

  const {credentials, customerId, roles} = await Async.auto({
    credentials: getCredentials,
    customerId: ['credentials', getCustomerId],
    roles: ['credentials', getRoles]
  });

  credentials.customerId = customerId;
  credentials.roles = roles;
  return credentials;
};

internals.getCart = async function(options, token, requestedCustomerId) {
  const cartId = _.get(options.request, 'params.id');
  const cart = await Carts.get(options, cartId);
  const userStore = await internals.getUserStore(options, token, cart.storeId, requestedCustomerId);
  const userCarts = await Users.getCarts(options, userStore.userId);
  const userCart = _.find(userCarts, {cartId: cart.id});

  if (_.isEmpty(userCart)) {
    throw Boom.notFound();
  }

  return _.merge({}, userStore, {cart});
};

internals.getUserStore = async function(options, token, storeId, requestedCustomerId) {
  const result = await internals.getUserOrAdminStore(options, token, storeId, requestedCustomerId, internals.getUser);

  if (_.isEmpty(result.store.users)) {
    throw Boom.forbidden();
  }

  if (result.store.users.indexOf(result.userId) < 0) {
    throw Boom.forbidden();
  }

  return result;
};

internals.getAdminStore = async function(options, token, storeId, requestedCustomerId) {
  const getSettings = async function() {
    return await internals.getCustomerSettings(options, requestedCustomerId);
  };

  const getCredentials = async function() {
    return await internals.getUserOrAdminStore(options, token, storeId, requestedCustomerId, internals.getAdmin);
  };

  const {credentials, settings} = await Async.parallel({
    settings: getSettings,
    credentials: getCredentials
  });

  if (settings.canManageStores) {
    return _.merge({}, credentials, {customer: {settings}});
  }

  throw Boom.forbidden();
};

internals.getUserOrAdminStore = async function(options, token, storeId, requestedCustomerId, userOrAdminFunc) {
  const store = await Stores.get(options, storeId);
  const customerId = requestedCustomerId || store.taylorCustomerId;
  const user = await userOrAdminFunc(options, token, customerId);

  if (store.taylorCustomerId !== user.customerId && store.masterTaylorCustomerId !== user.customerId) {
    throw Boom.notFound();
  }

  return _.merge({}, user, {customerId: store.taylorCustomerId}, {store});
};

internals.getAdmin = async function(options, token, requestedCustomerId) {
  const customer = await Customers.get(options, requestedCustomerId);

  if (customer.masterTaylorCustomerId === requestedCustomerId) {
    const credentials = await internals.getUser(options, token, requestedCustomerId, customer);

    if (_.includes(credentials.roles, 'admin')) {
      return _.merge({}, {customer}, credentials);
    }
  }

  throw Boom.unauthorized();
};

internals.getAnonymousStore = async function(options, requestedCustomerId, storeId) {
  const store = await Stores.get(options, storeId);

  if (store.isLoginRequired) {
    throw Boom.unauthorized('This store requires a user to be logged in');
  }

  if (_.isEmpty(requestedCustomerId)) {
    return store;
  }

  if (store.taylorCustomerId !== requestedCustomerId && store.masterTaylorCustomerId !== requestedCustomerId) {
    throw Boom.notFound();
  }

  return store;
};

internals.getCustomerSettings = async function(options, requestedCustomerId) {
  try {
    const result = await Customers.getSettings(options, requestedCustomerId);

    const visibleSettings = _.filter(result, 'isVisible');

    const reducer = function(settings, setting) {
      if (setting.value.toLowerCase() === 'true') {
        settings[setting.name] = true;
      } else if (setting.value.toLowerCase() === 'false') {
        settings[setting.name] = false;
      } else {
        settings[setting.name] = setting.value;
      }

      return settings;
    };

    return _.reduce(visibleSettings, reducer, {canManageStores: false});
  } catch (error) {
    if (_.get(error, 'output.statusCode') === 404) {
      return {canManageStores: false};
    }
    throw error;
  }
};
