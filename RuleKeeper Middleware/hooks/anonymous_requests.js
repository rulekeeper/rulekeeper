const PolicyManager = require('../pep/PolicyManager');
const EventManager = require('../events/EventManager');
const { getNestedValue } = require('./utils');

module.exports = function anonymousRequests(schema) {

  /* This hook is responsible for the anonymous requests trying to add data.
  * If the request is anonymous, we need to set the context for further enforcement */

  schema.pre('save', { document: true }, function (next) {
    if (this.internalQuery) { next(); return; }
    const { rulekeeper, request, response, _doc } = this;
    const { principal } = rulekeeper || {};

    const cookie = request.cookies? request.cookies.rulekeeper : null;
    if (!cookie) { next(); return; }

    const decodedCookie = JSON.parse(Buffer.from(cookie, 'base64').toString());
    const uuid = decodedCookie.uuid;
    if (!uuid) { next(); return; } //AND NOT AUTH TODO

    /* Check if table has personal data - returns (table, column) if it contains personal data */
    const hasPersonalData = PolicyManager.checkPersonalData(this);
    if (!hasPersonalData) { next(); return; }
    /* Check if the query contains the key that identifies the data subject - returns the key value if contains */
    const ownerValue = getNestedValue(_doc, hasPersonalData.column);
    if (!ownerValue) response.status(404).end(`New data: ${_doc} does not contain the entity identifier ${hasPersonalData.column}.`);

    /* If the new data contains the owner key, we must add the new info to the data tables (by sending the event to the Manager) */
    EventManager.sendNewAnonymousEntity(uuid, ownerValue);

    /* Locally update the data to ensure that the upcoming hooks and requests already evaluate with the updated data */
    PolicyManager.newLocalAnonymousEntity(uuid, ownerValue, decodedCookie.purpose)
    next();

  });

  // Update when column ownership changes TODO
  schema.pre(['updateOne', 'findOneAndUpdate'], { document: false, query: true }, function (next) {
    if (this.internalQuery) { next(); return; }
    const { rulekeeper, response, _doc } = this;
    const { principal } = rulekeeper || {};
     next();
  })
}
