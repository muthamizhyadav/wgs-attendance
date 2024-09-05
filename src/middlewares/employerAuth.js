const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { Employer } = require('../models/employer.model');

const VerifyAuth = async (req, res, next) => {
  const BearerHeader = req.headers['authorization'];
  if (typeof BearerHeader != undefined) {
    const bearer = BearerHeader.split(' ');
    const token = bearer[1];

    if (!token) {
      return res.send(httpStatus.UNAUTHORIZED, 'user must be LoggedIn....');
    }
    try {
      const payload = jwt.verify(token, config.jwt.secret);

      let finAdmin = await Employer.findById(payload.sub);
      if (!finAdmin) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Envalid User');
      }
      req.userId = payload.sub;
      return next();
    } catch {
      return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access Token');
    }
  } else {
    return res.send(httpStatus.UNAUTHORIZED, { message: 'Invalid Bearer Token' });
  }
};

module.exports = {
  VerifyAuth,
};
