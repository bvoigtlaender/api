const ErrorHandler = require('../helper/ErrorHandler')

errorMiddleware = (err, req, res, next) => {
    console.error(err)
    let statusCode = err.statusCode ? err.statusCode : 500
    let message = err.message ? err.message : 'Something went wrong'
    let errorType = err.name
    res.status(statusCode).json({
        errorType,
        message
    })
    next()
}

module.exports = errorMiddleware