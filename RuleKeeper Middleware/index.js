/* Add Mongoose Hooks */
const hooks = require('./hooks');

/* Load Manager components */
const PolicyManager = require('./pep/PolicyManager');
const EventManager = require('./events/EventManager');
const ConnectionManager = require('./config/ConnectionManager');

/* Import Express Middleware */
const contextService = require('./hooks/context');
const accessControlService = require('./hooks/access_control');
const cookieConsentService = require('./hooks/cookies');
const timeUtils = require('./timeUtils');


/**
 * This file contains the API to integrate the RuleKeeper middleware in Express applications.
 * The middleware intercepts requests and queries.
 * Restrictions:
 *      Mongoose middleware must be initialized before compiling the models (https://mongoosejs.com/docs/middleware.html#defining)
 *      Express middleware must be initialized before all other custom middleware, so that it is executed first (https://expressjs.com/en/guide/writing-middleware.html)
 *
 * RuleKeeper exports
 */

module.exports = {

  /**
   * Initializes RuleKeeper middleware
   * @param mongoose
   */
  init(mongoose) {
    ConnectionManager.setConnection(mongoose);
    mongoose.plugin(hooks);
    PolicyManager.init();
    EventManager.init();
  },
  addContext(app) {
    contextService.addContext(app);
    cookieConsentService.addCookieHandler(app);
    accessControlService.addAccessControlHook(app);
  },

  addMongooseMiddleware(mongoose) {
    ConnectionManager.setConnection(mongoose);
    mongoose.plugin(hooks);
  },

  initRuleKeeper() {
    PolicyManager.init();
    EventManager.init();
  },
  addContextMiddleware(app) {
    contextService.addContextMiddleware(app);
  },
  contextMiddlewareHandler: (req, res, next) => {
    return contextService.addContextHandler(req, res, next);
  },

  markAsInternalQuery: () => {
    contextService.markAsInternalQuery();
  },

  accessControlMiddlewareHandler: (req, res, next) => {
    return accessControlService.accessControlHandler(req, res, next);
  },

  measureRequestTime(app) {
    timeUtils.measureTime(app)
  }
};
