import { body, validationResult } from "express-validator"

function validate(req, res, next) {
    const errors = validationResult(req)

    if(errors.isEmpty()){
        return next()
    }

    res.status(400).json({
        errors: errors.array()
    })
}

export const registerValidator = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({min: 3, max: 30}).withMessage("Username must be between 3 and 30 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contains numbers, letters and underscore"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email should not be empty")
        .isEmail().withMessage("Email should be in correct format")
        .normalizeEmail(),
        
    body("password")
        .trim()
        .notEmpty().withMessage("password can't be empty")
        .isLength({min: 6}).withMessage("Password must have 6 or more characters"), 
        
    validate    
]

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email should not be empty")
        .isEmail().withMessage("Email should be in correct format")
        .normalizeEmail(),

    body("password")
        .trim()
        .notEmpty().withMessage("password can't be empty")
        .isLength({min: 6}).withMessage("Password must have 6 or more characters"),

    validate
]