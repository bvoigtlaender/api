require('dotenv').config()
const Connection = require('../connection')
const ObjectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const MongoController = require('./MongoController')
const ApiError = require('../helper/ErrorHandler')
const nodemailer = require('nodemailer');

const TOKEN_EXPIRATION = '10m'

var transporter = nodemailer.createTransport({
  service: 'iCloud',
  auth: {
    user: 'bjarne.voigtlaender@icloud.com',
    pass: 'vgrj-rfxn-uvbg-quzq'
  }
});

class UserController {
  static async register(username, email, password) {
    try {
      password = await bcrypt.hash(password, 10)
      const user = { username, email, password }
      const response = await Connection.db.collection('users').insertOne(user)
      if (response.insertedCount !== 1) throw new ApiError(400)
      return { message: "Successfully created", user }
    } catch (err) {
      throw (err)
    }
  }

  static async login(username, password) {
    try {
      const user = await this.getUserByName(username)
      if (!user) {
        throw new ApiError(401, 'Wrong credentials')
      } else {
        const query = {
          $set: {
            last_sync: Date.now()
          }
        }
        const authenticated = await bcrypt.compare(password, user.password)
        if (!authenticated) throw new ApiError(401, 'Wrong credentials')
        const accessToken = this.generateToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        this.saveRefreshToken(refreshToken)
        return { user, accessToken, refreshToken }
      }
    } catch (err) {
      console.error(`Couldnt login user: ${err}`)
      throw err
    }
  }

  static async logout(refreshToken) {
    try {
      const query = {
        $set: {
          last_logout: Date.now()
        }
      }
      const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
      await Connection.db.collection('gamedata').updateOne({ userid: new ObjectId(user._id) }, query)
      const response = Connection.db.collection('tokens').deleteOne({ token: refreshToken })
      return response
    } catch (err) {
      console.error(`Couldn't logout user: ${err}`)
    }
  }

  /**
   * 
   * @param {string} email 
   */
  static async forgot(email) {
    let user = await this.getUserByEmail(email)
    if (!user) user = await this.getUserByName(email)
    if (!user) throw new ApiError(404, 'No user found with that email')
    const resetToken = jwt.sign({ _id: user._id, user: user.username }, process.env.RESET_TOKEN_SECRET, { expiresIn: '5m' })
    var mailOptions = {
      from: 'bjarne.voigtlaender@icloud.com',
      to: user.email,
      subject: 'New Password',
      text: `Hello ${user.username},\nWe received an request to reset your password. You can change your password under the following link. ${process.env.ACCOUNT_MANAGEMENT_IP}/reset/${resetToken}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    return { resetToken }
  }

  static async reset(resetToken, password) {
    const { _id } = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET)
    const user = await this.getUserById(_id)
    password = await bcrypt.hash(password, 10)
    const response = await Connection.db.collection('users').updateOne({ _id: new ObjectId(user._id) }, { $set: { password } })
    if (response.result.ok === 1 && response.result.nModified === 1) {
      return { message: 'Successfully reset password' }
    } else {
      throw new ApiError(400)
    }
  }

  /**
   * @param {string} refreshToken 
   * @returns {accessToken}
   */
  static async token(refreshToken) {
    try {
      const refreshTokens = await this.getAllRefreshTokens()
      if (!refreshTokens.includes(refreshToken)) throw new ApiError(403, 'invalid refresh token')
      const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
      const accessToken = this.generateToken({ _id: user._id, user: user.username })
      return { accessToken }
    } catch (err) {
      console.error(`Couldn't renew token: ${err}`)
      throw err
    }
  }

  static async saveRefreshToken(token) {
    try {
      await Connection.db.collection('tokens').insertOne({ token })
    } catch (err) {
      console.error(`Couldnt save refreshToken: ${err}`)
      throw err
    }
  }

  static generateToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION })
  }

  static async getAllRefreshTokens() {
    try {
      let tokens = []
      const tokenDocs = await Connection.db.collection('tokens').find().toArray()
      tokenDocs.forEach(tokenDoc => tokens.push(tokenDoc.token))
      return tokens
    } catch (err) {
      console.error(`Couldnt get all tokens: ${err}`)
      throw err
    }
  }

  /**
   * @param {string} username 
   */
  static async getUserByName(username) {
    try {
      const user = await Connection.db.collection('users').findOne({ username })
      return user
    } catch (err) {
      console.error(`Couldnt get user by name: ${err}`)
      throw err
    }
  }

  static async getUserById(id) {
    try {
      const user = await MongoController.getById('users', id)
      return user
    } catch (err) {
      console.error(`Couldnt get User: ${err}`)
      throw err
    }
  }

  /**
   * @param {string} email 
   */
  static async getUserByEmail(email) {
    try {
      email = email.toLowerCase()
      const user = await Connection.db.collection('users').findOne({ email: email })
      return user
    } catch (err) {
      console.error(`Couldnt get user by email: ${err}`)
      throw err
    }
  }

  static async deleteUserById(id) {
    try {
      const { result } = await Connection.db.collection('users').deleteOne({ _id: new ObjectId(id) })
      if (result.ok === 1 && result.n === 1) {
        return { message: 'Successfully deleted user' }
      } else if (result.n === 0) {
        throw new ApiError(404, 'User not found')
      }
      throw new ApiError(400)
    } catch (err) {
      throw err
    }
  }

  static async getAllUsers() {
    try {
      const users = await Connection.db.collection('users').find().toArray()
      return users
    } catch (err) {
      console.error(`Couldnt get all users: ${err}`)
      throw err
    }
  }
}

module.exports = UserController