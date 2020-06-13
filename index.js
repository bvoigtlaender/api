const express = require("express")
const app = express()
const routes = require('./v1/routes')
const Connection = require('./connection')
const errorMiddleware = require('./middleware/errorMiddleware')
const loggerMiddleware = require('./middleware/loggerMiddleware')

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(loggerMiddleware)

app.use('/v1', routes)

app.use(errorMiddleware)

Connection.connectToMongo().then(() => {
  let server = app.listen(PORT, function () {
    console.log(`Listening on port ${server.address().port}...`)
  })
})
