const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const AppError = require('./utils/appError'); 
const globalErrorHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

const app = express();

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true
  },
  store: MongoStore.create({ mongoUrl: process.env.DATABASE })
};

app.use(session(sessionOptions));

app.use(express.json());

const bookRouter = require('./routes/bookRoutes');
const userRouter = require('./routes/userRoutes');
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
