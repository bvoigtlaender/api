const authorizationMiddleware = (req, res, next) => {
    const apiToken = req.headers['x-api-key']
    if (apiToken == null) return res.sendStatus(403)
    if (apiToken === process.env.API_TOKEN) {
        next()
    } else {
        return res.sendStatus(403)
    }
}

module.exports = authorizationMiddleware