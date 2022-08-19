const { v4: uuidv4 } = require('uuid');

module.exports = {

  hasCookie(req) {
    return req.cookies && req.cookies.id;
  },

  sendCookie(req, res) {
    if (!(req.cookies && req.cookies.id)) {
      const cookie = uuidv4();
      res.cookie('id', cookie, { httpOnly: true })
    }
  }


}

