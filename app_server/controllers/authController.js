const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { JWT_SECRET = 'dev-key' } = process.env;
const { JWT_EXPIRES_IN = '90d' } = process.env;
const { JWT_COOKIE_EXPIRES_IN = '90' } = process.env;

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN,
});

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.createUser = catchAsync(async (req, res, next) => {
  let { password } = req.body;
  password = password.match(/(\S){8,20}/);
  if (!password) {
    return next(new AppError('Please provide password!It should contain from 8 to 20 digits and letters and symbols @#$%', 400));
  }
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    about: req.body.about,
    avatar: req.body.avatar,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 201, res);
});
