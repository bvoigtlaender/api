const Connection = require('../connection')

loggerMiddleware = (req, res, next) => {
  next()
}

module.exports = loggerMiddleware