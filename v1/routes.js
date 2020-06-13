const express = require('express')
const router = express.Router()
const cors = require('cors')
const authorizationMiddleware = require('../middleware/authorizationMiddleware')

router.use(cors())

router.use('/', authorizationMiddleware, require('./users/auth'))
router.use('/users', authorizationMiddleware, require('./users/users'))

module.exports = router;