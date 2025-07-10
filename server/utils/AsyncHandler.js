const asyncHandler=(e)=>async(req,res,next)=>{
    try {
        await e(req,res,next)
    } catch (error) {
        next(error)
    }
}

export {asyncHandler}