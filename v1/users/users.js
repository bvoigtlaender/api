const express = require('express')
const router = express.Router()
const ObjectId = require('mongodb').ObjectID
const authenticationMiddleware = require('../../middleware/authenticationMiddleware')
const MongoController = require('../../controllers/MongoController')
const UserController = require('../../controllers/UserController')

router.get('/', authenticationMiddleware, (req, res, next) => {
  UserController.getAllUsers()
    .then(users => {
      res.status(200).json(users)
    })
    .catch(err => next(err))
})

router.post('/', (req, res, next) => {
  let schema = {
    username: {
      mandatory: true,
      unique: true,
      type: 'string'
    },
    email: {
      mandatory: true,
      unique: true,
      type: 'string',
      format: 2
    },
    password: {
      mandatory: true,
      type: 'string'
    }
  }

  MongoController.validate(req.body, schema, 'users')
    .then(() => {
      const { username, email, password } = MongoController.filter(req.body, schema)
      return UserController.register(username, email, password)
    })
    .then(val => res.status(201).json(val))
    .catch(err => next(err))
})

router.get('/:id', authenticationMiddleware, (req, res, next) => {
  UserController.getUserById(req.params.id)
    .then(user => {
      if (!user) res.sendStatus(404)
      if (user._id.equals(new ObjectId(req.user._id))) {
        res.send(user)
      } else {
        res.sendStatus(403)
      }
    })
    .catch(err => next(err))
})

router.delete('/:id', authenticationMiddleware, (req, res, next) => {
  if (req.params.id !== req.user._id) res.sendStatus(403)
  UserController.deleteUserById(req.params.id)
    .then(user => {
      res.send(user)
    })
    .catch(err => next(err))
})

module.exports = router
