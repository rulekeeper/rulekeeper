const contextService = require('request-context');
const listEndpoints = require('express-list-endpoints');
const cors = require('cors');
const { startTime, getDurationInMilliseconds} = require("../timeUtils");

module.exports = {
  addContext(app) {
    app.use(contextService.middleware('rulekeeper'));
    app.use(cors({ origin: 'https://localhost:3031' }));

    /* Sets the context of the request - principal and endpoint to be used in the policy enforcement */
    app.use((req, res, next) => {
      const start = startTime()
      const routes = getEndpoints(app);
      const { rulekeeper } = res.locals;
      if (rulekeeper && rulekeeper.username) contextService.set('rulekeeper.principal', rulekeeper.username);
      else if ( req.payload && req.payload.id) contextService.set('rulekeeper.principal', req.payload.id); //for express jwt users
      const matchedRoute = routes.find((route) => getMatchedRoute(route, req.url));
      const path = matchedRoute ? matchedRoute.path : null;
      const operation = `${req.method} ${path}`;
      contextService.set('rulekeeper.operation', operation);
      contextService.set('request', req);
      contextService.set('response', res);
      getDurationInMilliseconds (start)
      next();
    });
  },

  addContextHandler: (req, res, next) => {
    const start = startTime()
    const { rulekeeper } = res.locals;
    if (rulekeeper && rulekeeper.username) contextService.set('rulekeeper.principal', rulekeeper.username);
    let path = req.url;
    const params = Object.entries(req.params);
    if (params.length > 0)
      params.forEach(param => { path = path.replace(param[1], `:${param[0]}`) });
    const operation = `${req.method} ${path}`;
    contextService.set('rulekeeper.operation', operation);
    contextService.set('request', req);
    contextService.set('response', res);
    getDurationInMilliseconds(start)
    next();
    },

  markAsInternalQuery() {
    contextService.set('rulekeeper.isInternalQuery', true);
  },

  addContextMiddleware(app) {
      app.use(contextService.middleware('rulekeeper'));
  }
};

function getMatchedRoute(route, url) {
  if (route.path === '*') return null;
  const regex = route.path.replace(/:[^/]*/g, '[^\\/]*');
  const match = url.match(regex);
  return (match && url === match[0]);
}

function getEndpoints(app) {
  if (app.get('routes') == null) {
    const routes = listEndpoints(app);
    routes.sort((a,b) => (a.path > b.path) ? -1 : ((b.path > a.path) ? 1 : 0))
    app.set('routes', routes);
  }
  return app.get('routes');
}
