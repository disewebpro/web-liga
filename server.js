const express = require('express')
const next = require('next')
const session = require('express-session')

const MongoStore = require('connect-mongo')(session)

const mongoose = require('mongoose')
mongoose.Promise = global.Promise;
const connection = mongoose.createConnection('mongodb://localhost:27017/web-liga')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dir: '.', dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()

    server.use(session({
      secret: 'foo',
      resave: false,
      saveUninitialized: true,
      store: new MongoStore({ mongooseConnection: connection })
    }));

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(3000, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
  })
