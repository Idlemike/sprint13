const express = require('express');
const morgan = require('morgan');
const AppError = require('./app_server/utils/appError');
const globalErrorHandler = require('./app_server/controllers/errorController');
const userRouter = require('./app_server/routes/userRoutes');
const cardsRouter = require('./app_server/routes/cardsRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '5f2aecabc3d04d5a3818eab', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/users', userRouter);
app.use('/cards', cardsRouter);

/*PUBLIC*/
/*app.use('/', express.static(path.join(__dirname, 'public')));*/

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
