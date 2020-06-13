const express = require('express')
const router = express.Router()
const UserController = require('../../controllers/UserController')
const MongoController = require('../../controllers/MongoController')

router.post('/login', (req, res, next) => {
  let schema = {
    username: {
      mandatory: true,
      type: 'string'
    },
    password: {
      mandatory: true,
      type: 'string'
    }
  }
  MongoController.validate(req.body, schema, 'users')
    .then(() => {
      let filteredBody = MongoController.filter(req.body, schema)
      const { username, password } = filteredBody
      return UserController.login(username, password)
    })
    .then(val => {
      res.status(200).json({ message: 'Successfully logged in', accessToken: val.accessToken, refreshToken: val.refreshToken, userId: val.user._id })
    })
    .catch(err => next(err))
})

router.post('/token', (req, res, next) => {
  let schema = {
    refreshToken: {
      mandatory: true,
      type: 'string'
    }
  }
  MongoController.validate(req.body, schema, 'tokens')
    .then(() => {
      let filteredBody = MongoController.filter(req.body, schema)
      const { refreshToken } = filteredBody
      return UserController.token(refreshToken)
    })
    .then(token => {
      res.json(token)
    })
    .catch(err => next(err))
})

router.delete('/logout', (req, res, next) => {
  let schema = {
    refreshToken: {
      mandatory: true,
      type: 'string'
    }
  }
  MongoController.validate(req.body, schema, 'tokens')
    .then(() => {
      let filteredBody = MongoController.filter(req.body, schema)
      const { refreshToken } = filteredBody
      return UserController.logout(refreshToken)
    })
    .then(() => res.sendStatus(204))
    .catch(err => next(err))
})

router.post('/forgot', (req, res, next) => {
  let schema = {
    email: {
      mandatory: true,
      type: 'string'
    }
  }

  MongoController.validate(req.body, schema, 'users')
    .then(() => {
      const { email } = MongoController.filter(req.body, schema)
      return UserController.forgot(email)
    })
    .then((val) => res.json(val))
    .catch(err => next(err))
})

router.post('/reset', (req, res, next) => {
  let schema = {
    resetToken: {
      mandatory: true,
      type: 'string',
    },
    password: {
      mandotory: true,
      type: 'string'
    }
  }
  MongoController.validate(req.body, schema, 'tokens')
    .then(() => {
      const { resetToken, password } = MongoController.filter(req.body, schema)
      return UserController.reset(resetToken, password)
    })
    .then((val) => res.json(val))
    .catch(err => next(err))
})

module.exports = router