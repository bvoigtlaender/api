const errorInfo = {
    'NOT_UNIQUE': {
        message: 'Allready exists',
        status: 409
    },
    'MISSING_PARAMETER': {
        message: 'Parameter is missing',
        status: 400
    },
    'WRONG_TYPE': {
        message: 'Type is wrong',
        status: 400
    },
    'NO_ACCESS_TOKEN': {
        status: 401
    },
    'NO_REFRESH_TOKEN': {
        status: 401
    },
    'username is not unique': {
        message: 'Username allready taken',
        status: 400
    },
    'email is not unique': {
        message: 'Email allready used',
        status: 400
    },
    'jwt expired': {
        status: 403
    },
    403: {
        status: 403
    }
}


class ApiError extends Error {
    /**
     * @param {string} message 
     * @param {number} statusCode
     */
    constructor(statusCode, message) {
        super(message)
        this.name = 'ApiError'
        this.statusCode = statusCode
    }
}

module.exports = ApiError