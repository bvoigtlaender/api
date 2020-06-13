const jwt = require('jsonwebtoken')

const authenticationMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const authToken = authHeader && authHeader.split(' ')[1]
    if (authToken == null) return res.sendStatus(401)
    jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

module.exports = authenticationMiddleware