require('dotenv').config()
const express = require("express")
const app = express()
const exphbs = require('express-handlebars')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch');

const PORT = process.env.PORT || 4000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended: false }));
app.use(express.static('views/public'));

app.get('/reset/:token', (req, res, next) => {
  const { _id } = jwt.verify(req.params.token, process.env.RESET_TOKEN_SECRET)
  res.render('index', { token: req.params.token })
})

app.get('/', (req, res, next) => {
  res.render('index', { token: req.params.token })
})

app.post('/reset', (req, res, next) => {
  const data = { password: req.body.newpassword, resetToken: req.body.token }
  fetch(process.env.API_IP + '/v1/reset', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.API_TOKEN
    },
  })
    .then((response) => {
      if (response.status === 200) {
        res.render('success')
      } else {
        res.render('failure')
      }
    })
})

let server = app.listen(PORT, function () {
  console.log(`Listening on port ${server.address().port}...`)
})