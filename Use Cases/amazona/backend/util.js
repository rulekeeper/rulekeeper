const jwt = require('jsonwebtoken');
const config = require('./config');

const getToken = (user) => jwt.sign(
  {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  },
  config.JWT_SECRET,
  {
    expiresIn: '48h',
  },
);

const isAuth = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    const onlyToken = token.slice(7, token.length);
    jwt.verify(onlyToken, config.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({ message: 'Invalid Token' });
      }
      res.locals.rulekeeper = { username: decode.email };
      req.user = decode;
      next();
    });
  } else {
    return res.status(401).send({ message: 'Token is not supplied.' });
  }
};

const isAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(401).send({ message: 'Admin Token is not valid.' });
};

module.exports = { getToken, isAuth, isAdmin };
