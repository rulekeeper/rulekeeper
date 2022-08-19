module.exports = {

  initSession(res, username) {
    res.locals.rulekeeper = { username };
  }
}
