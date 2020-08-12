/*const path = require('path');*/

const Card = require('../models/cardsModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasLast = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-createdAt,name';
  req.query.fields = 'createdAt,name';
  next();
};
/*CARDS*/

exports.getCards = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Card.find(), req.query).filter().sort().limitFields().paginate();
  const cardsSchedule = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: cardsSchedule.length,
    data: {
      cardsSchedule,
    },
  });
});

exports.getCard = catchAsync(async (req, res, next) => {
  const card = await Card.findById(req.params.id);
  /*  console.log(card)*/
  if (!card) {
    return next(new AppError('No card found with ID', 404));
  }
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      card,
    },
  });
});

exports.postCard = catchAsync(async (req, res, next) => {
  const newCard = await Card.create(req.body);
  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      newCard,
    },
  });
});
exports.deleteCard = catchAsync(async (req, res, next) => {
  const card = await Card.findByIdAndRemove(req.params.id);
  if (!card) {
    return next(new AppError('No card found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.likeCard = catchAsync(async (req, res, next) => {
  const card = await Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true, runValidators: true },
  );
  if (!card) {
    return next(new AppError('No card found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: card,
  });
});

exports.dislikeCard = catchAsync(async (req, res, next) => {
  const card = await Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true, runValidators: true },
  );
  if (!card) {
    return next(new AppError('No card found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: card,
  });
});
