const cookieParser = require('cookie-parser');
const contextService = require('request-context');
const PolicyManager = require('../pep/PolicyManager');
const express = require('express');
const { startTime, getDurationInMilliseconds} = require("../timeUtils");

module.exports = {
  addCookieHandler(app) {
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use((req, res, next) => {
      const start = startTime()
      // Check here if principal is data subject. If not, no need to check cookies.
      const context = contextService.getContext('rulekeeper')
      const principalContext = PolicyManager.getPrincipalContext(context.principal);
      if (!isDataSubject(principalContext)) { next(); return; }

      /* First we need to check if the operation requires consent - aka has a personal data purpose */
      const operation = context.operation;
      const operationPurpose = PolicyManager.getOperationPurpose(operation);
      /* If the operation has a purpose, then it processes personal data and therefore needs consent. */
      if (operationPurpose) {
        /* We need to check if the user already gave consent (has a rulekeeper cookie that contains the consent of the operation)*/
        const cookie = req.cookies? req.cookies.rulekeeper : null;
        /* If the request already has a cookie, we need to check if it contains the consent of the operation */
        let consent = false; // variable to store if the cookie has the consent
        if (cookie) {
          const decodedCookie = JSON.parse(Buffer.from(cookie, 'base64').toString());
          const purposes = decodedCookie.purpose;
          /* If the cookie contains the consent of the operation, we set the context and simply carry on the operation */
          if (purposes.includes(operationPurpose)) {
            let { rulekeeper } = {};
            if (res.locals && res.locals.rulekeeper) rulekeeper = { username: res.locals.rulekeeper.username }
            else if (req.payload && req.payload.id) rulekeeper = { username: req.payload.id }
            if (!rulekeeper || !rulekeeper.username) contextService.set('rulekeeper.principal', decodedCookie.uuid);
            consent = true;
            getDurationInMilliseconds(start)
            next();
          }
        }
        /* If the cookie does not contain the consent of the operation or there is no cookie, we need to show the banner to the user */
        if (!cookie || !consent) {
          const url = process.env.SERVER_URL; // url of the rulekeeper manager (where we ask for the banner)
          const purposeData = PolicyManager.getPurposeData(operationPurpose); // data associated with the purpose of the operation (to show in the banner)
          const origin = req.get('Referer'); // original request to redirect after setting the context
          const encodedOrigin = Buffer.from(origin).toString('base64');
          const bannerData = { purpose: operationPurpose, data: purposeData } // we send the encoded object via query
          const encodedBannerData = Buffer.from(JSON.stringify(bannerData)).toString('base64');
          const bannerRequest = `${url}/consent/banner?data=${encodedBannerData}&origin=${encodedOrigin}` // url of the banner request
          res.redirect(307, bannerRequest)
        }
      }
      /* If the operation does not have a purpose, simply continue */
      else next();
    });
  },
};

function isDataSubject(context) {
  return context && context.roles && context.roles.includes('Data Subject');
}
