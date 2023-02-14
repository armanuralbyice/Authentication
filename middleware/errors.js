module.exports = async (err, req,res,next) => {

    err.statusCode = err.statusCode || 500;
    if(process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(err.statusCode).json({
            success:false,
            error:err,
            err: err.message,
            stack:err.stack
        })
    }
}

