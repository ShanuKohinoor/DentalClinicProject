// Base class error

class AppError extends Error {
    constructor(message, statusCode) {
        // If array --> convert to string for base Error
        super(Array.isArray(message) ? message.join(', ') : message);

        this.statusCode = statusCode;

        // Always store messages as array
        this.messages = Array.isArray(message) ? message : [message];

        // Maintain proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

 // Custom conflict error(409):- Used when two patients trying to book same appointment at same time

  class ConflictError extends AppError {
    constructor(message){
        super(message,409)
    }
  }

  //  Custom Not Found Error (404) : Used when user,patient,doctor,appoinment etc not exist

  class NotFoundError extends AppError {
    constructor(message){
        super(message,404)
    }
  }

  //  Custom Bad request Error(400) :- Used when client send invalid data
  class BadRequestError extends AppError{
    constructor(message){
        super(message,400)
    }
  }



  // Custom Unauthorized Error(401) :- Used when user doesn't have permission or don't have valid token

  class unAuthorizedError extends AppError{
    constructor(message){
        super(message,401)
    }
  }


  // Custom Duplicate Error(409):- Used  when user trying to register with an email id which already exist

   class DuplicateError extends AppError{
    constructor(message){
        super(message,409)
    }
   }


   
export {
    AppError,
    ConflictError,
    NotFoundError,
    BadRequestError,
    unAuthorizedError,
    DuplicateError
}