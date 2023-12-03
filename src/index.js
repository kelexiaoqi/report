//src/index.js
import express from 'express';
import session from 'express-session';
import login from './login.js';
import mongostore from 'connect-mongo';
import client from './dbclient.js';
import eventCreate from './eventCreate.js';
import path from 'path';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'TicketSystem',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
    store: mongostore.create({
      client,
      dbName: 'TicketSystem',
      collectionName: 'session',
    }),
  })
);
const PREAUTH_KEY = 'EIE4432ProjectJasonHoLokKi';
app.use((req, res, next) => {
  if (!req.session?.allow_access) {
    if (req.query?.authkey === PREAUTH_KEY) {
      req.session.allow_access = true;
    } else {
      res.status(401).json({
        status: 'failed',
        message: 'Unauthorized',
      });
    }
  }
  next();
});
app.use('/auth', login);
app.use('/', eventCreate);
app.get('/', (req, res) => {
  if (req.session.logged) {
    if (req.session.role === 'admin') {
      res.redirect('/eventAdmin.html');
    } else {
      res.redirect('/event.html');
    }
  } else {
    res.redirect('/login.html');
  }
});

app.use('/', express.static(path.join(process.cwd(), '/static')));
app.listen(8080, (req, res) => {
  console.log(new Date().toLocaleString('en-HK').toUpperCase());
  console.log('Server started at http://127.0.0.1:8080');
});
