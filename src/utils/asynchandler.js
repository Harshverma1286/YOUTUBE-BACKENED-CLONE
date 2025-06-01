const asynchandler = (fun) => async(req,res,next)=>{
    try{
        await fn(req,res,next);
    }catch(err){
        res.send(err.code || 500).json({
            success:false,
            message:err.message,
        })
    }
}

// const asynchandler = (requesthandler) =>{
//     (req,res,next)=>{
//         Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err));
//     }
// }

module.exports = {asynchandler};