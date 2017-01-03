const express = require('express')
const next = require('next')
const passport = require('passport')
const session = require('express-session')
const SteamStrategy = require('passport-steam').Strategy

const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
mongoose.Promise = global.Promise;
const connection = mongoose.createConnection('mongodb://localhost:27017/web-liga', (err) => {
  if (err) throw err
  console.log("Connected to MongoDB");
})

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: 'DBDC643CA768279DF0F2B1624C857477'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {

      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

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
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    server.use(passport.initialize());
    server.use(passport.session());

    server.get('/', (req, res) => {
      return handle(req, res)
    })

    server.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });

    // GET /auth/steam
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Steam authentication will involve redirecting
    //   the user to steamcommunity.com.  After authenticating, Steam will redirect the
    //   user back to this application at /auth/steam/return
    server.get('/auth/steam',
      passport.authenticate('steam', { failureRedirect: '/' }),
      function(req, res) {
        res.redirect('/');
      });

    // GET /auth/steam/return
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    server.get('/auth/steam/return',
      passport.authenticate('steam', { failureRedirect: '/' }),
      function(req, res) {
        res.redirect('/');
      });

    server.get('*', ensureAuthenticated, (req, res) => {
      return handle(req, res)
    })

    server.listen(3000, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
  })

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}