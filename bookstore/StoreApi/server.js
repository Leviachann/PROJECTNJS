const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('DB connection successful!'));

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true
  },
  store: MongoStore.create({
    mongoUrl: DB,
    collectionName: 'sessions' 
  })
};

app.use(session(sessionOptions));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
