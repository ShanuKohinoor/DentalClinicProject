 
 // import custon Base error class
 import { AppError } from "../utils/error.js";


 const errorHandlingMiddleware = (err,req,res,next)=>{
console.error('Error:',err)

    if (err instanceof AppError){
        return res.status(err.statusCode).render('error',{
            title: 'Error',
            messages: err.messages || [err.message],
            status: err.statusCode
        })
    }
    res.status(500).render('error',{      // Internal Server Error(500) for all unknown errors
        title: 'Error',
        messages: ['Internal Server Error'],      // Should send as array ifwe want other error messages in two lines
        status: 500
    })
 }

 export default errorHandlingMiddleware
