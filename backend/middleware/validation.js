const { body, validationResult } = require('express-validator')
const createError = require('http-errors')

const validateDonation = [
  body('title').trim().isLength({ min: 3, max: 100 }).escape(),
  body('description').trim().isLength({ min: 10, max: 1000 }).escape(),
  body('category').isIn(['food', 'clothing', 'electronics', 'books', 'other']),
  body('quantity').isInt({ min: 1, max: 10000 }),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(createError(400, { errors: errors.array() }))
    }
    next()
  }
]