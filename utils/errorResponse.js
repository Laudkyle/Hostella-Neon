class ErrorResponse extends Error {
  /**
   * Create custom ErrorResponse
   * @param {string} message Error message
   * @param {number} statusCode HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguish operational errors from programming errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Capture stack trace (excluding constructor call from it)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a bad request error (400)
   * @param {string} message Error message
   * @returns {ErrorResponse}
   */
  static badRequest(message = 'Bad Request') {
    return new ErrorResponse(message, 400);
  }

  /**
   * Create an unauthorized error (401)
   * @param {string} message Error message
   * @returns {ErrorResponse}
   */
  static unauthorized(message = 'Unauthorized') {
    return new ErrorResponse(message, 401);
  }

  /**
   * Create a forbidden error (403)
   * @param {string} message Error message
   * @returns {ErrorResponse}
   */
  static forbidden(message = 'Forbidden') {
    return new ErrorResponse(message, 403);
  }

  /**
   * Create a not found error (404)
   * @param {string} message Error message
   * @returns {ErrorResponse}
   */
  static notFound(message = 'Not Found') {
    return new ErrorResponse(message, 404);
  }

  /**
   * Create a conflict error (409)
   * @param {string} message Error message
   * @returns {ErrorResponse}
   */
  static conflict(message = 'Conflict') {
    return new ErrorResponse(message, 409);
  }

  /**
   * Create an internal server error (500)
   * @param {string} message Error message
   * @returns {ErrorResponse}
   */
  static internal(message = 'Internal Server Error') {
    return new ErrorResponse(message, 500);
  }

  /**
   * Create a validation error (422)
   * @param {string|object} errors Error message or validation errors object
   * @returns {ErrorResponse}
   */
  static validation(errors = 'Validation Failed') {
    const response = new ErrorResponse(
      typeof errors === 'string' ? errors : 'Validation errors occurred',
      422
    );
    
    if (typeof errors !== 'string') {
      response.errors = errors;
    }
    
    return response;
  }

  /**
   * Convert error to JSON response format
   * @returns {object}
   */
  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

module.exports = ErrorResponse;